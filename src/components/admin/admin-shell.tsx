"use client";
import {
  WorkspaceLoading,
  ListLoading,
  FormLoading,
} from "@/components/shared/loading";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Wallet,
  Settings2,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useCatalog } from "@/components/providers";
import { Brand } from "@/components/shared/header";
import { EmptyState } from "@/components/shared/states";
import { cn } from "@/lib/utils";
const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/orders", label: "Orders & cargo", icon: Package },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Rates & integrations", icon: Settings2 },
];
export function AdminShell({
  children,
  initialSidebar = "expanded",
}: {
  children: React.ReactNode;
  initialSidebar?: "expanded" | "collapsed";
}) {
  const [sidebar, setSidebar] = useState(initialSidebar);
  const collapsed = sidebar === "collapsed";
  function toggleSidebar() {
    const next = collapsed ? "expanded" : "collapsed";
    setSidebar(next);
    document.cookie = `admin-sidebar=${next}; Path=/admin; Max-Age=31536000; SameSite=Lax`;
  }
  const { viewer, connected } = useCatalog();
  const path = usePathname();
  if (connected && viewer === undefined)
    return (
      <WorkspaceLoading sidebar={sidebar}>
        {path === "/admin" ? undefined : path === "/admin/settings" ? (
          <FormLoading />
        ) : (
          <ListLoading />
        )}
      </WorkspaceLoading>
    );
  if (!viewer?.isAdmin)
    return (
      <EmptyState
        title="Administrator access required"
        description="Sign in with an administrator account to manage the store."
        href="/sign-in?next=/admin"
        action="Sign in"
      />
    );
  return (
    <div className="admin-layout" data-sidebar={sidebar}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <Brand />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="admin-navigation"
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        </div>
        <p className="admin-sidebar-label">STORE WORKSPACE</p>
        <nav id="admin-navigation" aria-label="Store administration">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(path === href && "selected")}
              aria-current={path === href ? "page" : undefined}
              aria-label={label}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} />
              <span className="admin-nav-label">{label}</span>
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="text-link admin-store-link mt-auto"
          aria-label="Back to storefront"
          title={collapsed ? "Back to storefront" : undefined}
        >
          <ArrowLeft size={15} />
          <span className="admin-nav-label">Back to storefront</span>
        </Link>
      </aside>
      <main className="admin-main">
        <div className="admin-workspace-bar">
          <span>
            Workspace <span aria-hidden="true">/</span>{" "}
            <strong>
              {links.find((link) => link.href === path)?.label ?? "Store"}
            </strong>
          </span>
          <span className="admin-profile" title={viewer.email}>
            {viewer.name || "Administrator"}
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}
