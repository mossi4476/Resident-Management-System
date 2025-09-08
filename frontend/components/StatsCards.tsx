'use client'

import { 
  UsersIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'

interface StatsCardsProps {
  stats: {
    total?: number
    pending?: number
    inProgress?: number
    resolved?: number
    closed?: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      name: 'Total Complaints',
      value: stats.total || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Pending',
      value: stats.pending || 0,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'In Progress',
      value: stats.inProgress || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Resolved',
      value: stats.resolved || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.name} className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{card.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
