import { clearWalletCache } from "@/lib/sui/passkey";
import { ROUTES } from "@/lib/utils/routes";
import { Coins, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../logo";

const navItems = [
  {
    group: "Management",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: ROUTES.DASHBOARD },
      { label: "Swap", icon: Coins, href: ROUTES.SWAP },
      { label: "Lending", icon: Coins, href: ROUTES.LENDING },
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
    <aside className="w-64 h-screen border-r border-gray-100 bg-white flex flex-col p-6 fixed left-0 top-0">
      <div className="mb-10">
        <Logo />
      </div>

      <nav className="flex-1 space-y-8">
        {navItems.map((group) => (
          <div key={group.group}>
            <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"}`}
                    />
                    <span className="font-medium text-2xl">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
