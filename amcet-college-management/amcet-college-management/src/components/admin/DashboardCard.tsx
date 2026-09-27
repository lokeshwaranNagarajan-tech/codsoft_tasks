import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function DashboardCard({ title, value, icon: Icon }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center hover:shadow-lg transition">
      <div>
        <p className="text-gray-500">{title}</p>
        <h2 className="text-3xl font-bold text-blue-900">{value}</h2>
      </div>

      <div className="bg-blue-100 p-3 rounded-full">
        <Icon className="text-blue-900" size={30} />
      </div>
    </div>
  );
}