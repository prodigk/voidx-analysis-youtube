import Link from "next/link";
import { AuthLayout, AuthNotice } from "@/components/auth-layout";
import { InviteSignupForm } from "@/components/auth-forms";
import { getInviteByToken, isAuthEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InviteSignupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = isAuthEnabled() ? await getInviteByToken(token) : null;
  const blockedReason = !isAuthEnabled()
    ? "회원 기능을 사용하려면 DATABASE_URL 환경변수가 필요합니다."
    : !invite
      ? "초대 링크를 찾지 못했습니다."
      : invite.status !== "pending"
        ? "이미 사용되었거나 더 이상 유효하지 않은 초대입니다."
        : "";

  return (
    <AuthLayout
      eyebrow="Invite Signup"
      title="초대 수락"
      description="초대받은 이메일로 계정을 만들고 리서치 보드에 참여합니다."
      footer={
        <Link
          href="/login"
          className="font-semibold text-[#222222] underline underline-offset-4"
        >
          이미 계정이 있나요?
        </Link>
      }
    >
      {blockedReason || !invite ? (
        <AuthNotice title="가입할 수 없음" description={blockedReason} />
      ) : (
        <InviteSignupForm token={token} email={invite.email} />
      )}
    </AuthLayout>
  );
}
