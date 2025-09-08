'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { residentsApi, complaintsApi, notificationsApi } from '@/lib/api'
import Sidebar from './Sidebar'
import Header from './Header'
import ResidentsList from './ResidentsList'
import ComplaintsList from './ComplaintsList'
import ComplaintForm from './ComplaintForm'
import ResidentForm from './ResidentForm'
import StatsCards from './StatsCards'
import NotificationsPanel from './NotificationsPanel'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [residents, setResidents] = useState([])
  const [complaints, setComplaints] = useState([])
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [residentsRes, complaintsRes, notificationsRes, statsRes] = await Promise.all([
        residentsApi.getAll(),
        user?.role === 'RESIDENT' ? complaintsApi.getMyComplaints() : complaintsApi.getAll(),
        notificationsApi.getAll(),
        complaintsApi.getStats(),
      ])
      
      setResidents(residentsRes.data)
      setComplaints(complaintsRes.data)
      setNotifications(notificationsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplaintCreated = () => {
    loadData()
    setActiveTab('complaints')
  }

  const handleComplaintUpdated = () => {
    loadData()
  }

  const handleResidentCreated = () => {
    loadData()
    setActiveTab('residents')
  }

  const handleResidentUpdated = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} userRole={user?.role || 'RESIDENT'} />
        
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
              <StatsCards stats={stats} />
            </div>
          )}
          
          {activeTab === 'residents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Residents</h1>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                  <button
                    onClick={() => setActiveTab('add-resident')}
                    className="btn btn-primary"
                  >
                    Add Resident
                  </button>
                )}
              </div>
              <ResidentsList 
                residents={residents} 
                onUpdate={handleResidentUpdated}
                userRole={user?.role || 'RESIDENT'}
                currentUserId={user?.id || ''}
              />
            </div>
          )}
          
          {activeTab === 'add-resident' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Resident</h1>
              <ResidentForm onSuccess={handleResidentCreated} />
            </div>
          )}
          
          {activeTab === 'complaints' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
                <button
                  onClick={() => setActiveTab('add-complaint')}
                  className="btn btn-primary"
                >
                  New Complaint
                </button>
              </div>
              <ComplaintsList 
                complaints={complaints} 
                onUpdate={handleComplaintUpdated}
                userRole={user?.role || 'RESIDENT'}
                currentUserId={user?.id || ''}
              />
            </div>
          )}
          
          {activeTab === 'add-complaint' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">New Complaint</h1>
              <ComplaintForm onSuccess={handleComplaintCreated} />
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>
              <NotificationsPanel notifications={notifications} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
