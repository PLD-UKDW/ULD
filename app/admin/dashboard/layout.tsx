import Sidebar from "@/components/layouts/SideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-20 flex min-h-[calc(100dvh-5rem)] bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}