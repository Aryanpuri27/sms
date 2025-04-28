import type { ReactNode } from "react"
import StudentSidebar from "@/components/student-sidebar"

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
