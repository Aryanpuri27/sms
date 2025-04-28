import type { ReactNode } from "react"
import TeacherSidebar from "@/components/teacher-sidebar"

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <TeacherSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
