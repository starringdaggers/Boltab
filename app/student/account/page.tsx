import ChangePasswordForm from "@/components/account/ChangePasswordForm";
import ProfilePictureRequestForm from "@/components/account/ProfilePictureRequestForm";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <ProfilePictureRequestForm displayName={session?.name || "You"} />
      <ChangePasswordForm />
    </div>
  );
}
