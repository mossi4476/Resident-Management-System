'use client'

import { 
  HomeIcon, 
  UsersIcon, 
  ExclamationTriangleIcon, 
  BellIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole: string
}

export default function Sidebar({ activeTab, onTabChange, userRole }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      roles: ['ADMIN', 'MANAGER', 'RESIDENT']
    },
    {
      id: 'residents',
      name: 'Residents',
      icon: UsersIcon,
      roles: ['ADMIN', 'MANAGER']
    },
    {
      id: 'complaints',
      name: 'Complaints',
      icon: ExclamationTriangleIcon,
      roles: ['ADMIN', 'MANAGER', 'RESIDENT']
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      roles: ['ADMIN', 'MANAGER', 'RESIDENT']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              </li>
            )
          })}
          
          {/* Quick Actions */}
          <li className="pt-4">
            <div className="border-t border-gray-200 pt-4">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
          </li>
          
          {userRole === 'RESIDENT' && (
            <li>
              <button
                onClick={() => onTabChange('add-complaint')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'add-complaint'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <PlusIcon className="mr-3 h-5 w-5" />
                New Complaint
              </button>
            </li>
          )}
          
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <li>
              <button
                onClick={() => onTabChange('add-resident')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === 'add-resident'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <PlusIcon className="mr-3 h-5 w-5" />
                Add Resident
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  )
}
