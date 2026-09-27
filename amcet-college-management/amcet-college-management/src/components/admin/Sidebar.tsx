"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  UserCog,
  ClipboardCheck,
  Receipt,
  LogOut,
} from "lucide-react";

const menus = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Faculty", href: "/admin/faculty", icon: GraduationCap },
  { name: "Departments", href: "/admin/departments", icon: Building2 },
  { name: "Subjects", href: "/admin/subjects", icon: BookOpen },
  { name: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
  { name: "Fees", href: "/admin/fees", icon: Receipt },
  { name: "Admins", href: "/admin/admins", icon: UserCog },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">AMCET ERP</h1>
        <p className="text-sm text-blue-200">Admin Panel</p>
      </div>

      <nav className="mt-5 space-y-1 px-3">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href;

          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                active
                  ? "bg-white text-blue-900 font-semibold"
                  : "hover:bg-blue-800"
              }`}
            >
              <Icon size={20} />
              {menu.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-blue-700">
        <button className="flex items-center gap-3 text-red-300 hover:text-white">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}