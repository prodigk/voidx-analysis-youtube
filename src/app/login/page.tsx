import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/auth-forms";
import { getUserCount, isAuthEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const canBootstrap = isAuthEnabled() && (await getUserCount()) === 0;

  return (
    <AuthLayout
      eyebrow="Private Research"
      title="로그인"
      description="초대받은 사용자만 접근할 수 있는 YouTube 리서치 보드입니다."
      footer={
        canBootstrap ? (
          <Link
            href="/signup/admin"
            className="font-semibold text-[#222222] underline underline-offset-4"
          >
            최초 Admin 계정 만들기
          </Link>
        ) : null
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
