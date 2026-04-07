import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { GlobalSearch } from "@/components/global-search"
import { ReminderNotifier } from "@/components/layout/reminder-notifier"
import { NotificationCenter } from "@/components/layout/notification-center"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CRM Platform",
  description: "Web-based CRM for lead management",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full bg-[#f8fafc]">
            <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300 px-6 h-20 flex items-center justify-between gap-8">
              <div className="flex items-center gap-4 shrink-0">
                <SidebarTrigger className="h-10 w-10 text-slate-500 hover:text-indigo-600 transition-colors" />
                <div className="h-8 w-px bg-slate-200" />
              </div>
              
              <div className="flex-1 max-w-2xl px-4">
                <GlobalSearch />
              </div>

              <div className="flex items-center gap-4 ml-auto lg:min-w-[12rem] justify-end">
                  <NotificationCenter />
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm group hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                    LV
                  </div>
              </div>
            </header>
            
            <div className="p-8 lg:p-10 transition-all duration-500">
              {children}
            </div>
          </main>
        </SidebarProvider>
        <ReminderNotifier />
        <Toaster />
      </body>
    </html>
  )
}
