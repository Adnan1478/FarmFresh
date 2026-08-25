// import { useCRM } from '../context/CRMContext'

export default function StatCard({ icon: Icon, label, value, change, color }) {
  const { isDarkMode } = useCRM();

  return (
    <div
      className={`p-6 rounded-xl border transition hover:shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="text-white" size={22} />
        </div>
        <span
          className={`text-sm font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {change >= 0 ? "+" : ""}
          {change}%
        </span>
      </div>
      <p
        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}
