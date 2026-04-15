import Sidebar from "@/components/layouts/SideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 px-0">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 pt-24 sm:p-6 sm:pt-28">{children}</main>
    </div>
  );
}
