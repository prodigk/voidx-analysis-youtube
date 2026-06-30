import { AuthNotice } from "@/components/auth-layout";
import { MemberManagement } from "@/components/member-management";
import { PageHeader } from "@/components/ui-blocks";
import { isAuthEnabled, listMembers, requirePageAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  if (!isAuthEnabled()) {
    return (
      <div>
        <PageHeader
          eyebrow="Members"
          title="회원 관리"
          description="회원 기능은 Vercel에 연결된 DATABASE_URL이 있을 때 활성화됩니다."
        />
        <AuthNotice
          title="DATABASE_URL 필요"
          description="Vercel Postgres/Neon 연결 정보를 로컬 또는 배포 환경에 설정한 뒤 회원 관리 기능을 사용할 수 있습니다."
        />
      </div>
    );
  }

  const currentUser = await requirePageAdmin();
  const { users, invites } = await listMembers();

  return (
    <div>
      <PageHeader
        eyebrow="Members"
        title="초대 기반 회원 관리"
        description="초대 링크를 만들고, 가입한 멤버의 역할과 접근 상태를 관리합니다."
      />
      <MemberManagement
        users={users}
        invites={invites}
        currentUserId={currentUser?.id ?? ""}
      />
    </div>
  );
}
