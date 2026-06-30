import Link from "next/link";
import { AuthLayout, AuthNotice } from "@/components/auth-layout";
import { AdminSignupForm } from "@/components/auth-forms";
import { getUserCount, isAuthEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSignupPage() {
  const authEnabled = isAuthEnabled();
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const userCount = authEnabled ? await getUserCount() : 0;
  const blockedReason = !authEnabled
    ? "회원 기능을 사용하려면 DATABASE_URL 환경변수가 필요합니다."
    : !adminEmail
      ? "최초 Admin 생성을 위해 ADMIN_EMAIL 환경변수를 설정하세요."
      : userCount > 0
        ? "이미 최초 Admin 계정이 생성되어 있습니다."
        : "";

  return (
    <AuthLayout
      eyebrow="Admin Bootstrap"
      title="최초 Admin 생성"
      description="DB에 사용자가 없을 때 한 번만 Admin 계정을 만들 수 있습니다."
      footer={
        <Link
          href="/login"
          className="font-semibold text-[#222222] underline underline-offset-4"
        >
          로그인으로 돌아가기
        </Link>
      }
    >
      {blockedReason ? (
        <AuthNotice title="생성할 수 없음" description={blockedReason} />
      ) : (
        <AdminSignupForm adminEmail={adminEmail} />
      )}
    </AuthLayout>
  );
}
