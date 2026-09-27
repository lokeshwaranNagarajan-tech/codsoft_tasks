import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-blue-900">
        AMCET College Management System
      </h2>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
          <Search size={18} className="text-gray-500" />
          <input
            placeholder="Search..."
            className="bg-transparent outline-none ml-2"
          />
        </div>

        <Bell className="text-blue-800" />

        <div className="bg-blue-900 text-white rounded-full w-10 h-10 flex items-center justify-center">
          A
        </div>
      </div>
    </header>
  );
}