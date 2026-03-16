import { SidebarProvider, SidebarTrigger } from "../../../shared/ui/sidebar";
import { AppSidebar } from "../../app-sidebar/ui/AppSidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center gap-2 border-b bg-card px-4 py-3 md:px-6">
            <SidebarTrigger />
          </div>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
