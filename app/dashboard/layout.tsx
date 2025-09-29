"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SidebarStateProvider } from "@/lib/sidebar-state-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SidebarStateProvider>
        <AppSidebar />
        <SidebarInset className="m-0 h-[calc(100vh-4rem)]">
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </SidebarInset>
      </SidebarStateProvider>
    </SidebarProvider>
  )
}
