import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "./_components/AppHeader";
import { AppSidebar } from "./_components/AppSidebar";

const WorkspaceLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="w-full">
        <AppHeader />
        {children}
      </div>
    </SidebarProvider>
  );
};
export default WorkspaceLayout;
