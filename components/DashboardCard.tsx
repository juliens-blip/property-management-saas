interface DashboardCardProps {
  title: string
  value: number | string
  icon: string
  bgColor?: string
  textColor?: string
}

export default function DashboardCard({
  title,
  value,
  icon,
  bgColor = 'bg-white',
  textColor = 'text-gray-900',
}: DashboardCardProps) {
  return (
    <div className={`${bgColor} rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div className="text-5xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}
