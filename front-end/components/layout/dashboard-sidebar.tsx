import { clearWalletCache } from "@/lib/sui/passkey";
import { ROUTES } from "@/lib/utils/routes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../logo";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  FileText,
  Award,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    group: "MANAGEMENT",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: ROUTES.DASHBOARD },
      { label: "Swap", icon: ArrowLeftRight, href: ROUTES.SWAP },
      { label: "Lending", icon: TrendingUp, href: ROUTES.LENDING },
      // { label: "Invoices", icon: FileText, href: ROUTES.INVOICES },
    ],
  },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearWalletCache();
    router.push(ROUTES.HOME);
  };

  return (
    <aside className="w-64 h-screen border-r border-gray-50 bg-white flex flex-col p-6 fixed left-0 top-0">
      <div className="mb-10 px-4">
        <Logo />
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
        {navItems.map((group) => (
          <div key={group.group}>
            <h3 className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] mb-4 px-4">
              {group.group}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-[22px] transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-[#00d084]/5 text-[#00d084]"
                        : "text-[#64748b] hover:bg-gray-50 hover:text-[#111827]"
                    }`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${isActive ? "text-[#00d084]" : "text-[#94a3b8] group-hover:text-[#475569]"}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[17px] ${isActive ? "font-bold" : "font-semibold"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[22px] text-[#64748b] hover:bg-red-50 hover:text-red-600 transition-all duration-200 group cursor-pointer"
        >
          <LogOut className="w-6 h-6 text-[#94a3b8] group-hover:text-red-500" />
          <span className="text-[17px] font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};
