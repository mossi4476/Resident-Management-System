'use client'

import { useState, useEffect } from 'react'
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline'
import { notificationsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface NotificationsPanelProps {
  notifications: any[]
}

export default function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications)
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setLocalNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      )
      toast.success('Notification marked as read')
    } catch (error: any) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true)
      await notificationsApi.markAllAsRead()
      setLocalNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      toast.success('All notifications marked as read')
    } catch (error: any) {
      toast.error('Failed to mark all notifications as read')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id)
      setLocalNotifications(prev => prev.filter(notif => notif.id !== id))
      toast.success('Notification deleted')
    } catch (error: any) {
      toast.error('Failed to delete notification')
    }
  }

  const unreadCount = localNotifications.filter(notif => !notif.isRead).length

  if (localNotifications.length === 0) {
    return (
      <div className="text-center py-12">
        <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
        <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Notifications ({localNotifications.length})
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
            className="btn btn-primary text-sm disabled:opacity-50"
          >
            {isLoading ? 'Marking...' : `Mark all as read (${unreadCount})`}
          </button>
        )}
      </div>
      
      <ul className="divide-y divide-gray-200">
        {localNotifications.map((notification) => (
          <li key={notification.id} className={`px-4 py-4 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Mark as read"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="Delete notification"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
