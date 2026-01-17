import { Bell, Globe } from "lucide-react";

interface TopBarProps {
  email: string | undefined;
}

export const TopBar = ({ email }: TopBarProps) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900">
        Good Afternoon <span className="text-gray-600 font-medium">{email}</span>
      </h1>

      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-full border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-full border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
          <Globe className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
          {email?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
