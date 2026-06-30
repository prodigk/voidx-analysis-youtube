# Member MVP - 초대 기반 회원 관리 기획

## 1. 목적

현재 서비스는 YouTube Data API, OpenAI API, PDF export 등 API 사용 권한과 비용이 연결된 개인용 리서치 보드이다. 앞으로 다른 사용자를 초대해 함께 사용할 수 있도록 하되, MVP에서는 운영 복잡도를 낮추고 Admin이 접근 권한을 직접 통제하는 구조를 우선한다.

회원 기능의 목적은 다음과 같다.

- API Key와 분석 생성 비용을 비로그인 사용자로부터 보호한다.
- 저장된 채널, 인사이트 리포트, 영상 기획안을 비공개 리서치 자산으로 관리한다.
- Admin이 초대한 사람만 가입할 수 있게 한다.
- 회원 원본 데이터와 세션 데이터는 Vercel에 연결된 Postgres/Neon DB에 저장한다.

## 2. 사용자 유형과 권한

### 2.1 Role

| Role | 설명 | 주요 권한 |
| --- | --- | --- |
| `admin` | 서비스 소유자. MVP에서는 1명을 기본 전제로 한다. | 모든 앱 기능 사용, 회원 초대, 초대 취소, 멤버 비활성화, 역할 변경 |
| `member` | Admin 초대로 가입한 사용자. | 리포트/채널/전략 화면 조회, YouTube 데이터 조회, AI 분석 생성 |

### 2.2 Status

| Status | 설명 | 로그인 가능 여부 |
| --- | --- | --- |
| `active` | 정상 사용 가능 | 가능 |
| `inactive` | Admin이 비활성화한 사용자 | 불가 |

MVP에서는 `pending` 사용자를 별도 `users` row로 만들지 않는다. 가입 전 상태는 `invites` 테이블에서 관리한다.

## 3. 핵심 정책

- 최초 Admin은 `ADMIN_EMAIL` 환경변수로 지정한다.
- DB에 사용자가 0명일 때만 `ADMIN_EMAIL`과 일치하는 이메일로 Admin 가입을 허용한다.
- 최초 Admin 생성 이후 모든 가입은 유효한 초대 링크를 통해서만 가능하다.
- 초대 링크는 Admin 화면에서 생성하고, Admin이 직접 복사해 전달한다.
- MVP에서는 이메일 자동 발송, 소셜 로그인, 매직 링크, 비밀번호 재설정 메일을 제외한다.
- 모든 앱 화면은 로그인 필요 상태로 전환한다.
- 비용이 발생하거나 데이터를 변경하는 API는 로그인 필요 상태로 전환한다.
- 회원 관리 화면과 회원 관리 API는 `admin`만 접근 가능하다.

## 4. 사용자 플로우

### 4.1 최초 Admin 가입

1. Admin이 `/signup/admin`에 접근한다.
2. 앱은 DB의 `users` count를 확인한다.
3. 사용자가 0명이고 입력 이메일이 `ADMIN_EMAIL`과 일치하면 가입 폼을 보여준다.
4. Admin은 이름과 비밀번호를 입력한다.
5. 서버는 비밀번호를 hash로 저장하고 `role = admin`, `status = active` 사용자 row를 생성한다.
6. 가입 완료 후 session cookie를 발급하고 Dashboard로 이동한다.

차단 조건:

- `ADMIN_EMAIL`이 설정되지 않았으면 가입 불가.
- DB에 사용자가 1명 이상 있으면 `/signup/admin`은 가입 불가 상태를 보여준다.
- 입력 이메일이 `ADMIN_EMAIL`과 다르면 가입 불가.

### 4.2 멤버 초대

1. Admin이 `/members`에 접근한다.
2. 초대 생성 패널에 이메일과 역할을 입력한다. 기본 역할은 `member`이다.
3. 서버는 랜덤 invite token을 생성한다.
4. DB에는 token 원문이 아니라 `token_hash`를 저장한다.
5. Admin 화면은 `/signup/invite/{token}` 형태의 초대 링크를 보여준다.
6. Admin은 초대 링크를 복사해 대상자에게 직접 전달한다.

초대 기본값:

- 기본 만료 시간은 생성 후 7일이다.
- 같은 이메일로 `pending` 초대가 이미 있으면 새 초대 생성 전 기존 초대를 `cancelled` 처리하거나 재생성한다.
- 이미 `active` 사용자인 이메일은 초대 생성 불가이다.

### 4.3 초대 가입

1. 사용자가 `/signup/invite/[token]`에 접근한다.
2. 서버는 token hash로 `invites` row를 찾는다.
3. 초대 상태가 `pending`이고 `expires_at`이 현재보다 미래이면 가입 폼을 보여준다.
4. 가입 폼은 초대 이메일을 고정 표시하고, 이름과 비밀번호만 입력받는다.
5. 서버는 사용자 row를 생성하고 invite를 `accepted`로 변경한다.
6. session cookie를 발급하고 Dashboard로 이동한다.

차단 조건:

- token이 없거나 hash가 일치하지 않으면 404 또는 만료 안내.
- `accepted`, `cancelled`, `expired` 초대는 가입 불가.
- 같은 이메일의 사용자가 이미 존재하면 가입 불가.

### 4.4 로그인과 로그아웃

로그인:

1. 사용자가 `/login`에서 이메일과 비밀번호를 입력한다.
2. 서버는 이메일로 사용자를 조회한다.
3. `status = active`이고 비밀번호 검증에 성공하면 session token을 생성한다.
4. DB에는 `token_hash`를 저장하고 브라우저에는 httpOnly secure cookie를 설정한다.
5. 로그인 후 이전 요청 경로가 있으면 그 경로로, 없으면 Dashboard로 이동한다.

로그아웃:

1. 사용자가 `/logout` 또는 로그아웃 버튼을 누른다.
2. 서버는 현재 session row를 삭제한다.
3. session cookie를 만료시키고 `/login`으로 이동한다.

## 5. 보호 범위

### 5.1 화면 보호

로그인이 필요한 화면:

- `/`
- `/categories`
- `/channels`
- `/channels/[id]`
- `/insights`
- `/insights/[id]`
- `/strategy`
- `/settings`

Admin만 접근 가능한 화면:

- `/members`

로그인 없이 접근 가능한 화면:

- `/login`
- `/signup/admin`
- `/signup/invite/[token]`

### 5.2 API 보호

로그인이 필요한 API:

- `/api/analysis`
- `/api/analysis/generate`
- `/api/analysis/[id]/tags`
- `/api/analysis/[id]/export/markdown`
- `/api/analysis/[id]/export/pdf`
- `/api/channels`
- `/api/channels/[id]/favorite`
- `/api/video-plans`
- `/api/youtube/channel`
- `/api/youtube/channels/search`
- `/api/youtube/refresh`
- `/api/youtube/videos`

Admin만 접근 가능한 API:

- `/api/members`
- `/api/members/[id]`
- `/api/members/invites`
- `/api/members/invites/[id]`

공개 가능 API:

- `/api/health/storage`는 운영 점검 편의를 위해 공개 유지할 수 있다. 단, 민감한 connection string이나 secret은 절대 반환하지 않는다.
- 인증 API(`/api/auth/*`)는 공개 endpoint이지만 각 action 내부에서 token, password, role 검증을 수행한다.

## 6. DB 설계

DB는 기존 `DATABASE_URL` 기반 Vercel Postgres/Neon을 사용한다. 구현 시 `src/lib/database.ts`의 `ensureDatabaseSchema()`에서 기존 테이블과 함께 회원 테이블을 생성한다.

### 6.1 `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_login_at TIMESTAMPTZ
);
```

정책:

- `email`은 lowercase trim 후 저장한다.
- `password_hash`에는 원문 비밀번호를 저장하지 않는다.
- MVP에서는 Admin 1명을 전제로 하지만 DB 제약으로 Admin 수를 제한하지 않는다. 운영 정책과 UI에서 통제한다.

### 6.2 `invites`

```sql
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by TEXT NOT NULL REFERENCES users(id),
  accepted_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL
);
```

정책:

- token 원문은 생성 직후 Admin에게 한 번만 보여준다.
- DB에는 token hash만 저장한다.
- 초대 링크 재확인이 필요하면 기존 초대를 취소하고 새 token을 생성한다.

### 6.3 `sessions`

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL
);
```

정책:

- session token 원문은 cookie에만 저장한다.
- DB에는 token hash만 저장한다.
- 기본 session 만료는 14일이다.
- 사용자가 비활성화되면 기존 session은 모두 무효화한다.

### 6.4 `audit_logs`

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL
);
```

기록 대상:

- Admin 가입
- 로그인 성공
- 로그인 실패
- 로그아웃
- 초대 생성
- 초대 취소
- 초대 수락
- 멤버 비활성화
- 역할 변경

## 7. 서버 설계

### 7.1 인증 helper

`src/lib/auth.ts`를 추가해 인증 공통 로직을 모은다.

필수 함수:

- `hashPassword(password: string): Promise<string>`
- `verifyPassword(password: string, hash: string): Promise<boolean>`
- `createRandomToken(): string`
- `hashToken(token: string): string`
- `createSession(userId: string): Promise<string>`
- `getCurrentUser(): Promise<AuthUser | null>`
- `requireUser(): Promise<AuthUser>`
- `requireAdmin(): Promise<AuthUser>`
- `destroySession(token: string): Promise<void>`

권장 구현:

- Node `crypto`의 `randomBytes`로 token 생성.
- 비밀번호 hash는 `bcrypt` 또는 `argon2` 사용. MVP 구현 시 의존성은 하나만 선택한다.
- session token hash는 SHA-256으로 저장한다.
- cookie 이름은 `ce_session`으로 한다.

### 7.2 Cookie 정책

Session cookie:

- name: `ce_session`
- httpOnly: true
- secure: production에서는 true
- sameSite: `lax`
- path: `/`
- maxAge: 14일

### 7.3 Middleware 또는 Layout 보호

권장 구현은 `middleware.ts`에서 route 보호를 수행하는 방식이다.

- 공개 route: `/login`, `/signup/admin`, `/signup/invite/:path*`, static asset
- Admin route: `/members/:path*`
- 나머지 앱 route: 로그인 필요
- API route는 각 route handler 내부에서 `requireUser()` 또는 `requireAdmin()`을 호출한다.

주의:

- Edge middleware에서는 Neon DB 접근이 복잡해질 수 있다. 구현 난도가 커지면 페이지/layout과 API handler에서 서버 측 검증을 우선 적용한다.
- 어떤 방식을 선택하든 API handler 보호는 반드시 별도로 구현한다.

## 8. API 설계

### 8.1 Auth API

`POST /api/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User",
    "role": "member"
  }
}
```

`POST /api/auth/logout`

- 현재 session 삭제.
- cookie 만료.
- `{ "ok": true }` 반환.

`POST /api/auth/admin/bootstrap`

- DB 사용자 수가 0명일 때만 동작.
- `ADMIN_EMAIL`과 일치하는 이메일만 허용.
- 성공 시 Admin user와 session 생성.

`GET /api/auth/invite/[token]`

- 초대 token 상태를 확인하고 가입 폼에 표시할 email, role, expiresAt을 반환한다.

`POST /api/auth/invite/accept`

Request:

```json
{
  "token": "raw_invite_token",
  "name": "User",
  "password": "password"
}
```

- 유효한 초대면 user 생성, invite `accepted` 처리, session 생성.

### 8.2 Members API

`GET /api/members`

- Admin 전용.
- users 목록과 최근 초대 목록을 반환한다.

`PATCH /api/members/[id]`

- Admin 전용.
- `role` 또는 `status` 변경.
- 자기 자신을 `inactive`로 바꾸는 요청은 차단한다.

`POST /api/members/invites`

Request:

```json
{
  "email": "new-user@example.com",
  "role": "member"
}
```

Response:

```json
{
  "invite": {
    "id": "invite_id",
    "email": "new-user@example.com",
    "role": "member",
    "expiresAt": "2026-07-07T00:00:00.000Z"
  },
  "inviteUrl": "http://localhost:3000/signup/invite/raw_token"
}
```

`PATCH /api/members/invites/[id]`

- Admin 전용.
- `status = cancelled` 처리.

## 9. 화면 설계

### 9.1 `/login`

목적:

- 기존 앱 셸 없이 단일 로그인 폼을 보여준다.

구성:

- 서비스명: Channel Essence
- 설명: "초대받은 사용자만 접근할 수 있는 리서치 보드입니다."
- 이메일 입력
- 비밀번호 입력
- 로그인 버튼
- 에러 메시지
- 최초 설정 안내 링크: 사용자가 0명일 때만 `/signup/admin` 노출

### 9.2 `/signup/admin`

목적:

- 최초 Admin 계정을 생성한다.

구성:

- `ADMIN_EMAIL`과 일치하는 이메일 입력
- 이름 입력
- 비밀번호 입력
- 비밀번호 확인 입력
- Admin 계정 생성 버튼

상태:

- 생성 가능
- 이미 Admin 존재
- `ADMIN_EMAIL` 미설정
- 이메일 불일치

### 9.3 `/signup/invite/[token]`

목적:

- 초대받은 사용자가 계정을 만든다.

구성:

- 초대 이메일 고정 표시
- 역할 표시
- 이름 입력
- 비밀번호 입력
- 비밀번호 확인 입력
- 가입 버튼

상태:

- 유효한 초대
- 만료된 초대
- 취소된 초대
- 이미 사용된 초대
- 잘못된 token

### 9.4 `/members`

목적:

- Admin이 회원과 초대를 관리한다.

구성:

- Overview cards: 전체 사용자 수, active 멤버 수, pending 초대 수
- Members table: 이름, 이메일, 역할, 상태, 최근 로그인, 생성일, 액션
- Invite panel: 이메일 입력, 역할 선택, 초대 생성 버튼
- Invites table: 이메일, 역할, 상태, 만료일, 생성일, 초대 취소 액션
- 최근 생성 초대 링크 복사 영역

UI 원칙:

- 기존 앱의 흰색 패널, 14px radius, 검정/분홍 accent 톤을 유지한다.
- 회원 관리는 운영 도구이므로 과한 hero 대신 dense한 리스트와 폼 중심으로 구성한다.
- 역할과 상태는 badge로 표시한다.
- 위험 액션인 비활성화/초대 취소는 확인 UI를 둔다.

### 9.5 AppShell 변경

- 로그인한 사용자 이름과 역할을 사이드바 하단에 표시한다.
- `admin`에게만 `Members` 메뉴를 노출한다.
- 로그아웃 버튼을 사이드바 하단 또는 사용자 메뉴에 배치한다.

## 10. 보안과 검증 정책

비밀번호:

- 최소 10자 이상.
- 이메일과 동일한 문자열 금지.
- 비밀번호 확인 값과 일치해야 한다.
- 저장 시 반드시 hash만 저장한다.

이메일:

- lowercase trim으로 정규화.
- 기본 이메일 형식 검증을 수행한다.

초대:

- token 원문은 DB에 저장하지 않는다.
- 만료된 초대는 가입 시 자동으로 `expired` 처리할 수 있다.
- 동일 이메일 중복 초대는 pending 1개만 허용한다.

세션:

- expired session은 인증 실패로 처리한다.
- inactive user의 session은 인증 실패로 처리한다.
- 로그아웃 시 현재 session을 삭제한다.

Audit:

- 회원 관리와 인증 실패/성공 이벤트는 `audit_logs`에 기록한다.
- audit metadata에는 secret, password, raw token을 저장하지 않는다.

## 11. 구현 단계

### Phase 1 - DB와 서버 인증

- `ensureDatabaseSchema()`에 `users`, `invites`, `sessions`, `audit_logs` 생성 추가.
- `src/lib/auth.ts` 추가.
- login, logout, bootstrap, invite accept API 구현.
- 기존 비용 발생 API에 `requireUser()` 적용.

### Phase 2 - 화면과 네비게이션

- `/login`, `/signup/admin`, `/signup/invite/[token]` 화면 구현.
- `AppShell`에 사용자 정보와 로그아웃 추가.
- `/members` Admin 화면 구현.
- `Members` nav item은 Admin에게만 노출.

### Phase 3 - 권한과 운영 안정화

- Admin-only API 보호.
- 초대 취소, 멤버 비활성화, 역할 변경 구현.
- audit log 기록 연결.
- Vercel production 환경에 `ADMIN_EMAIL` 추가.

## 12. 테스트 시나리오

### 12.1 최초 Admin 가입

- DB 사용자 수가 0명이고 email이 `ADMIN_EMAIL`이면 Admin 생성 성공.
- DB 사용자 수가 0명이어도 email이 `ADMIN_EMAIL`과 다르면 실패.
- DB 사용자 수가 1명 이상이면 bootstrap 가입 실패.
- `ADMIN_EMAIL`이 없으면 bootstrap 화면과 API 모두 실패 안내.

### 12.2 초대 가입

- Admin이 member 초대를 생성하면 invite URL이 반환된다.
- 유효한 invite token으로 가입하면 user 생성, invite accepted 처리, session 생성.
- 만료된 token은 가입 불가.
- 취소된 token은 가입 불가.
- 이미 accepted 된 token은 가입 불가.
- 이미 존재하는 email은 가입 불가.

### 12.3 로그인과 세션

- 올바른 email/password이면 로그인 성공.
- 잘못된 password이면 401.
- inactive user는 로그인 실패.
- expired session cookie는 인증 실패.
- 로그아웃 후 보호 화면 접근 시 `/login`으로 이동.

### 12.4 권한

- 비로그인 사용자는 앱 화면 접근 시 `/login`으로 이동.
- 비로그인 API 요청은 401을 반환.
- `member`는 `/insights`, `/channels`, `/strategy` 사용 가능.
- `member`는 `/members` 접근 불가.
- `member`는 `/api/members` 접근 시 403.
- `admin`은 초대 생성, 초대 취소, 멤버 비활성화, 역할 변경 가능.
- Admin은 자기 자신을 비활성화할 수 없다.

### 12.5 회귀 테스트

- 로그인 후 기존 Insight Board 리스트와 상세가 정상 표시된다.
- 로그인 후 YouTube 데이터 조회가 정상 동작한다.
- 로그인 후 AI 분석 생성과 저장이 정상 동작한다.
- 로그인 후 Markdown/PDF export가 정상 동작한다.

## 13. MVP 제외 범위

- 이메일 자동 발송.
- 비밀번호 재설정 메일.
- 소셜 로그인.
- 매직 링크 로그인.
- 조직/팀/워크스페이스.
- 상세 권한 매트릭스(`viewer`, `editor`, `billing` 등).
- 사용자별 사용량 제한과 과금.
- 2FA.
- SSO/SAML.

## 14. 향후 확장

- Resend를 연결해 초대 메일과 비밀번호 재설정 메일 발송.
- `viewer`, `editor`, `admin` 권한으로 세분화.
- 분석 생성 횟수와 API 사용량을 사용자별로 집계.
- Admin audit log 화면 추가.
- 장기적으로 Clerk, Descope, Auth0 등 외부 인증 서비스로 이전할 수 있도록 내부 user id와 provider id를 분리하는 컬럼 추가.
