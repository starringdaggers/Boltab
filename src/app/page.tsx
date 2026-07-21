import { redirect } from "next/navigation";

export default function Home() {
  // The real marketing landing page gets built in Phase 5.
  // For now, root sends visitors straight to sign in.
  redirect("/login");
}
