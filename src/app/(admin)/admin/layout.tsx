import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
export const metadata = {
  title: "Store administration",
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed =
    (await cookies()).get("admin-sidebar")?.value === "collapsed";
  return (
    <AdminShell initialSidebar={collapsed ? "collapsed" : "expanded"}>
      {children}
    </AdminShell>
  );
}
