import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
