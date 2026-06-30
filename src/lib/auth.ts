import "server-only";

import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  ensureDatabaseSchema,
  getSql,
  hasDatabase,
  toIsoString,
} from "@/lib/database";

export type UserRole = "admin" | "member";
export type UserStatus = "active" | "inactive";
export type InviteStatus = "pending" | "accepted" | "cancelled" | "expired";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export type MemberUser = AuthUser & {
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type MemberInvite = {
  id: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
  invitedBy: string;
  acceptedBy: string | null;
};

const SESSION_COOKIE = "ce_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const INVITE_MAX_AGE_DAYS = 7;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at: unknown;
  updated_at: unknown;
  last_login_at: unknown | null;
};

type UserWithPasswordRow = UserRow & {
  password_hash: string;
};

type InviteRow = {
  id: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  expires_at: unknown;
  invited_by: string;
  accepted_by: string | null;
  created_at: unknown;
};

export function isAuthEnabled() {
  return hasDatabase();
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string, email?: string) {
  if (password.length < 10) {
    return "비밀번호는 10자 이상이어야 합니다.";
  }

  if (email && password.toLowerCase().includes(normalizeEmail(email))) {
    return "비밀번호에 이메일 주소를 그대로 포함할 수 없습니다.";
  }

  return null;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(
    password,
    salt,
    SCRYPT_KEY_LENGTH,
    SCRYPT_PARAMS,
  ).toString("hex");

  return [
    "scrypt",
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    salt,
    hash,
  ].join("$");
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, n, r, p, salt, hash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !n || !r || !p || !salt || !hash) {
    return false;
  }

  const candidate = scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  const expected = Buffer.from(hash, "hex");

  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

export function createRandomToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json(
    { error: "Admin 권한이 필요합니다." },
    { status: 403 },
  );
}

export async function requireApiUser() {
  if (!isAuthEnabled()) {
    return { user: null, response: null };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { user: null, response: unauthorizedResponse() };
  }

  return { user, response: null };
}

export async function requireApiAdmin() {
  const { user, response } = await requireApiUser();

  if (response) {
    return { user: null, response };
  }

  if (!user || user.role !== "admin") {
    return { user: null, response: forbiddenResponse() };
  }

  return { user, response: null };
}

export async function getUserCount() {
  if (!isAuthEnabled()) {
    return 0;
  }

  await ensureDatabaseSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM users
  `) as { count: number }[];

  return Number(rows[0]?.count ?? 0);
}

export async function createAdminUser({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) {
  assertAuthConfigured();

  const normalizedEmail = normalizeEmail(email);
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? "");

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL 환경변수가 설정되지 않았습니다.");
  }

  if (normalizedEmail !== adminEmail) {
    throw new Error("최초 Admin 이메일과 일치하지 않습니다.");
  }

  if ((await getUserCount()) > 0) {
    throw new Error("이미 최초 Admin 계정이 생성되어 있습니다.");
  }

  assertAccountInput(normalizedEmail, name, password);

  const user = await insertUser({
    email: normalizedEmail,
    name,
    password,
    role: "admin",
  });

  await logAudit({
    actorUserId: user.id,
    action: "admin.bootstrap",
    targetType: "user",
    targetId: user.id,
  });

  return user;
}

export async function loginWithPassword(email: string, password: string) {
  assertAuthConfigured();
  await ensureDatabaseSchema();

  const normalizedEmail = normalizeEmail(email);
  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, name, password_hash, role, status, created_at, updated_at, last_login_at
    FROM users
    WHERE email = ${normalizedEmail}
    LIMIT 1
  `) as UserWithPasswordRow[];
  const user = rows[0];

  if (!user || user.status !== "active") {
    await logAudit({
      action: "auth.login_failed",
      targetType: "user",
      targetId: normalizedEmail,
      metadata: { reason: user ? "inactive" : "not_found" },
    });
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  if (!verifyPassword(password, user.password_hash)) {
    await logAudit({
      action: "auth.login_failed",
      targetType: "user",
      targetId: user.id,
      metadata: { reason: "password" },
    });
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  await sql`
    UPDATE users
    SET last_login_at = ${new Date().toISOString()}, updated_at = ${new Date().toISOString()}
    WHERE id = ${user.id}
  `;

  await logAudit({
    actorUserId: user.id,
    action: "auth.login_success",
    targetType: "user",
    targetId: user.id,
  });

  return rowToAuthUser(user);
}

export async function createSession(userId: string) {
  assertAuthConfigured();
  await ensureDatabaseSchema();

  const sql = getSql();
  const token = createRandomToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);

  await sql`
    INSERT INTO sessions (
      id, user_id, token_hash, expires_at, created_at, last_seen_at
    )
    VALUES (
      ${randomUUID()},
      ${userId},
      ${hashToken(token)},
      ${expiresAt.toISOString()},
      ${now.toISOString()},
      ${now.toISOString()}
    )
  `;

  return token;
}

export async function destroyCurrentSession() {
  if (!isAuthEnabled()) {
    return;
  }

  const token = await getSessionToken();

  if (!token) {
    return;
  }

  const sql = getSql();

  await sql`
    DELETE FROM sessions
    WHERE token_hash = ${hashToken(token)}
  `;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isAuthEnabled()) {
    return null;
  }

  await ensureDatabaseSchema();
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT users.id, users.email, users.name, users.role, users.status,
      users.created_at, users.updated_at, users.last_login_at
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ${hashToken(token)}
      AND sessions.expires_at > NOW()
      AND users.status = 'active'
    LIMIT 1
  `) as UserRow[];
  const user = rows[0];

  if (!user) {
    return null;
  }

  await sql`
    UPDATE sessions
    SET last_seen_at = ${new Date().toISOString()}
    WHERE token_hash = ${hashToken(token)}
  `;

  return rowToAuthUser(user);
}

export async function requirePageUser() {
  if (!isAuthEnabled()) {
    return null;
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requirePageAdmin() {
  if (!isAuthEnabled()) {
    return null;
  }

  const user = await requirePageUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return user;
}

export async function createInvite({
  email,
  role,
  invitedBy,
}: {
  email: string;
  role: UserRole;
  invitedBy: string;
}) {
  assertAuthConfigured();
  await ensureDatabaseSchema();

  const normalizedEmail = normalizeEmail(email);

  if (!validateEmail(normalizedEmail)) {
    throw new Error("올바른 이메일을 입력하세요.");
  }

  const sql = getSql();
  const existingUsers = (await sql`
    SELECT id
    FROM users
    WHERE email = ${normalizedEmail}
    LIMIT 1
  `) as { id: string }[];

  if (existingUsers[0]) {
    throw new Error("이미 가입된 이메일입니다.");
  }

  await sql`
    UPDATE invites
    SET status = 'cancelled'
    WHERE email = ${normalizedEmail}
      AND status = 'pending'
  `;

  const token = createRandomToken();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + INVITE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  );
  const inviteId = randomUUID();

  await sql`
    INSERT INTO invites (
      id, email, token_hash, role, status, expires_at, invited_by, created_at
    )
    VALUES (
      ${inviteId},
      ${normalizedEmail},
      ${hashToken(token)},
      ${role},
      'pending',
      ${expiresAt.toISOString()},
      ${invitedBy},
      ${now.toISOString()}
    )
  `;

  await logAudit({
    actorUserId: invitedBy,
    action: "invite.created",
    targetType: "invite",
    targetId: inviteId,
    metadata: { email: normalizedEmail, role },
  });

  const invite = await getInviteById(inviteId);

  if (!invite) {
    throw new Error("초대 생성 결과를 찾지 못했습니다.");
  }

  return { invite, token };
}

export async function getInviteByToken(token: string) {
  if (!isAuthEnabled()) {
    return null;
  }

  await ensureDatabaseSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, role, status, expires_at, invited_by, accepted_by, created_at
    FROM invites
    WHERE token_hash = ${hashToken(token)}
    LIMIT 1
  `) as InviteRow[];
  const invite = rows[0];

  if (!invite) {
    return null;
  }

  if (invite.status === "pending" && new Date(toIsoString(invite.expires_at)) < new Date()) {
    await sql`
      UPDATE invites
      SET status = 'expired'
      WHERE id = ${invite.id}
    `;
    return { ...rowToInvite(invite), status: "expired" as InviteStatus };
  }

  return rowToInvite(invite);
}

export async function acceptInvite({
  token,
  name,
  password,
}: {
  token: string;
  name: string;
  password: string;
}) {
  assertAuthConfigured();

  const invite = await getInviteByToken(token);

  if (!invite || invite.status !== "pending") {
    throw new Error("유효한 초대 링크가 아닙니다.");
  }

  if (new Date(invite.expiresAt) < new Date()) {
    throw new Error("만료된 초대 링크입니다.");
  }

  assertAccountInput(invite.email, name, password);

  const sql = getSql();
  const existingUsers = (await sql`
    SELECT id
    FROM users
    WHERE email = ${invite.email}
    LIMIT 1
  `) as { id: string }[];

  if (existingUsers[0]) {
    throw new Error("이미 가입된 이메일입니다.");
  }

  const user = await insertUser({
    email: invite.email,
    name,
    password,
    role: invite.role,
  });

  await sql`
    UPDATE invites
    SET status = 'accepted', accepted_by = ${user.id}
    WHERE id = ${invite.id}
  `;

  await logAudit({
    actorUserId: user.id,
    action: "invite.accepted",
    targetType: "invite",
    targetId: invite.id,
  });

  return user;
}

export async function listMembers() {
  assertAuthConfigured();
  await ensureDatabaseSchema();

  const sql = getSql();
  const users = (await sql`
      SELECT id, email, name, role, status, created_at, updated_at, last_login_at
      FROM users
      ORDER BY created_at DESC
    `) as UserRow[];
  const invites = (await sql`
      SELECT id, email, role, status, expires_at, invited_by, accepted_by, created_at
      FROM invites
      ORDER BY created_at DESC
      LIMIT 50
    `) as InviteRow[];

  return {
    users: users.map(rowToMemberUser),
    invites: invites.map(rowToInvite),
  };
}

export async function updateMember({
  id,
  role,
  status,
  actor,
}: {
  id: string;
  role?: UserRole;
  status?: UserStatus;
  actor: AuthUser;
}) {
  assertAuthConfigured();
  await ensureDatabaseSchema();

  if (id === actor.id && status === "inactive") {
    throw new Error("자기 자신은 비활성화할 수 없습니다.");
  }

  const sql = getSql();
  const rows = (await sql`
    UPDATE users
    SET
      role = COALESCE(${role ?? null}, role),
      status = COALESCE(${status ?? null}, status),
      updated_at = ${new Date().toISOString()}
    WHERE id = ${id}
    RETURNING id, email, name, role, status, created_at, updated_at, last_login_at
  `) as UserRow[];
  const user = rows[0];

  if (!user) {
    throw new Error("회원을 찾지 못했습니다.");
  }

  if (status === "inactive") {
    await sql`
      DELETE FROM sessions
      WHERE user_id = ${id}
    `;
  }

  await logAudit({
    actorUserId: actor.id,
    action: "member.updated",
    targetType: "user",
    targetId: id,
    metadata: { role, status },
  });

  return rowToMemberUser(user);
}

export async function cancelInvite(id: string, actor: AuthUser) {
  assertAuthConfigured();
  await ensureDatabaseSchema();

  const sql = getSql();
  const rows = (await sql`
    UPDATE invites
    SET status = 'cancelled'
    WHERE id = ${id}
      AND status = 'pending'
    RETURNING id, email, role, status, expires_at, invited_by, accepted_by, created_at
  `) as InviteRow[];
  const invite = rows[0];

  if (!invite) {
    throw new Error("취소할 수 있는 초대를 찾지 못했습니다.");
  }

  await logAudit({
    actorUserId: actor.id,
    action: "invite.cancelled",
    targetType: "invite",
    targetId: id,
  });

  return rowToInvite(invite);
}

function assertAuthConfigured() {
  if (!isAuthEnabled()) {
    throw new Error(
      "회원 기능을 사용하려면 DATABASE_URL 환경변수가 필요합니다.",
    );
  }
}

function assertAccountInput(email: string, name: string, password: string) {
  if (!validateEmail(email)) {
    throw new Error("올바른 이메일을 입력하세요.");
  }

  if (!name.trim()) {
    throw new Error("이름을 입력하세요.");
  }

  const passwordError = validatePassword(password, email);

  if (passwordError) {
    throw new Error(passwordError);
  }
}

async function insertUser({
  email,
  name,
  password,
  role,
}: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}) {
  await ensureDatabaseSchema();

  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO users (
      id, email, name, password_hash, role, status, created_at, updated_at
    )
    VALUES (
      ${randomUUID()},
      ${email},
      ${name.trim()},
      ${hashPassword(password)},
      ${role},
      'active',
      ${now},
      ${now}
    )
    RETURNING id, email, name, role, status, created_at, updated_at, last_login_at
  `) as UserRow[];

  return rowToAuthUser(rows[0]);
}

async function getInviteById(id: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, role, status, expires_at, invited_by, accepted_by, created_at
    FROM invites
    WHERE id = ${id}
    LIMIT 1
  `) as InviteRow[];

  return rows[0] ? rowToInvite(rows[0]) : null;
}

async function getSessionToken() {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE)?.value ?? "";
}

async function logAudit({
  actorUserId = null,
  action,
  targetType,
  targetId = null,
  metadata = {},
}: {
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!isAuthEnabled()) {
    return;
  }

  const sql = getSql();

  await sql`
    INSERT INTO audit_logs (
      id, actor_user_id, action, target_type, target_id, metadata, created_at
    )
    VALUES (
      ${randomUUID()},
      ${actorUserId},
      ${action},
      ${targetType},
      ${targetId},
      ${JSON.stringify(metadata)}::jsonb,
      ${new Date().toISOString()}
    )
  `;
}

function rowToAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
  };
}

function rowToMemberUser(row: UserRow): MemberUser {
  return {
    ...rowToAuthUser(row),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    lastLoginAt: row.last_login_at ? toIsoString(row.last_login_at) : null,
  };
}

function rowToInvite(row: InviteRow): MemberInvite {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    expiresAt: toIsoString(row.expires_at),
    createdAt: toIsoString(row.created_at),
    invitedBy: row.invited_by,
    acceptedBy: row.accepted_by,
  };
}
