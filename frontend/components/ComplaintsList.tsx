'use client'

import { useState, useEffect, useMemo } from 'react'
import { PencilIcon, TrashIcon, EyeIcon, ChatBubbleLeftIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { complaintsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import EditComplaintForm from './EditComplaintForm'
import { useWebSocket } from '@/hooks/useWebSocket'

interface ComplaintsListProps {
  complaints: any[]
  onUpdate: () => void
  userRole: string
  currentUserId: string
}

export default function ComplaintsList({ complaints, onUpdate, userRole, currentUserId }: ComplaintsListProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [complaintToDelete, setComplaintToDelete] = useState<any>(null)
  const [localComplaints, setLocalComplaints] = useState(complaints)
  const { onComplaintCreated, onComplaintUpdated, onComplaintDeleted, isConnected } = useWebSocket()
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [complaintToEdit, setComplaintToEdit] = useState<any>(null)
  
  // Inline attachments state
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [openAttachmentsId, setOpenAttachmentsId] = useState<string | null>(null)
  const [attachmentsByComplaint, setAttachmentsByComplaint] = useState<Record<string, any[]>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState<boolean>(false)
 
  const downloadFile = async (url: string, fileName: string) => {
    try {
      const res = await fetch(url, { credentials: 'include' })
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(link.href)
    } catch {
      window.open(url, '_blank')
    }
  }

  const triggerFilePicker = (complaintId: string) => {
    const input = document.getElementById(`file-${complaintId}`) as HTMLInputElement | null
    input?.click()
  }

  const onInlineFileChange = async (complaintId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingId(complaintId)
    try {
      await complaintsApi.uploadAttachment(complaintId, file)
      toast.success('Attachment uploaded')
      // refresh list for this complaint if opened
      if (openAttachmentsId === complaintId) {
        const res = await complaintsApi.listAttachments(complaintId)
        setAttachmentsByComplaint(prev => ({ ...prev, [complaintId]: res.data || [] }))
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingId(null)
      // reset input value to allow same file re-select
      e.target.value = ''
    }
  }

  const toggleAttachments = async (complaintId: string) => {
    if (openAttachmentsId === complaintId) {
      setOpenAttachmentsId(null)
      return
    }
    try {
      const res = await complaintsApi.listAttachments(complaintId)
      setAttachmentsByComplaint(prev => ({ ...prev, [complaintId]: res.data || [] }))
      setOpenAttachmentsId(complaintId)
    } catch (e) {
      toast.error('Failed to load attachments')
    }
  }

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      PENDING: 'badge-pending',
      IN_PROGRESS: 'badge-in-progress',
      RESOLVED: 'badge-resolved',
      CLOSED: 'badge-closed',
    }
    return statusClasses[status] || 'badge-gray'
  }

  const getPriorityBadge = (priority: string) => {
    const priorityClasses: { [key: string]: string } = {
      LOW: 'badge-low',
      MEDIUM: 'badge-medium',
      HIGH: 'badge-high',
      URGENT: 'badge-urgent',
    }
    return priorityClasses[priority] || 'badge-gray'
  }

  const handleDelete = async (id: string) => {
    try {
      await complaintsApi.delete(id)
      toast.success('Complaint deleted successfully')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete complaint')
    }
  }

  const handleAddComment = async (complaintId: string) => {
    try {
      await complaintsApi.addComment(complaintId, commentText)
      toast.success('Comment added successfully')
      setCommentText('')
      setShowCommentModal(false)
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    }
  }

  const confirmDelete = (complaint: any) => {
    setComplaintToDelete(complaint)
    setShowDeleteModal(true)
  }

  const executeDelete = async () => {
    if (complaintToDelete) {
      await handleDelete(complaintToDelete.id)
      setShowDeleteModal(false)
      setComplaintToDelete(null)
    }
  }

  // Filter and search logic
  const filteredComplaints = useMemo(() => {
    return localComplaints.filter(complaint => {
      const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           complaint.apartment.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !statusFilter || complaint.status === statusFilter
      const matchesPriority = !priorityFilter || complaint.priority === priorityFilter
      const matchesCategory = !categoryFilter || complaint.category === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [complaints, searchTerm, statusFilter, priorityFilter, categoryFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter])

  // Update local complaints when props change
  useEffect(() => {
    setLocalComplaints(complaints)
  }, [complaints])

  // Load attachments when a complaint is selected
  useEffect(() => {
    const load = async () => {
      if (!selectedComplaint) return setAttachmentsByComplaint({})
      try {
        const res = await complaintsApi.listAttachments(selectedComplaint.id)
        setAttachmentsByComplaint({ [selectedComplaint.id]: res.data || [] })
      } catch (e) {
        setAttachmentsByComplaint({})
      }
    }
    load()
  }, [selectedComplaint])

  const handleUpload = async () => {
    if (!selectedComplaint || !selectedFile) return
    setUploading(true)
    try {
      await complaintsApi.uploadAttachment(selectedComplaint.id, selectedFile)
      setSelectedFile(null)
      const res = await complaintsApi.listAttachments(selectedComplaint.id)
      setAttachmentsByComplaint({ [selectedComplaint.id]: res.data || [] })
      toast.success('Attachment uploaded')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!selectedComplaint) return
    try {
      await complaintsApi.deleteAttachment(selectedComplaint.id, attachmentId)
      setAttachmentsByComplaint(prev => ({
        [selectedComplaint.id]: (prev[selectedComplaint.id] || []).filter((a: any) => a.id !== attachmentId),
      }))
      toast.success('Attachment deleted')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed')
    }
  }

  // WebSocket event handlers
  useEffect(() => {
    console.log('🔌 ComplaintsList: Setting up WebSocket event handlers...');
    console.log('🔌 ComplaintsList: isConnected =', isConnected);
    
    const unsubscribeCreated = onComplaintCreated((data) => {
      console.log('📥 Received complaint.created event:', data)
      toast.success('New complaint created!', {
        duration: 3000,
        icon: '📝',
      })
      // Refresh the complaints list
      onUpdate()
    })

    const unsubscribeUpdated = onComplaintUpdated((data) => {
      console.log('📥 Received complaint.updated event:', data)
      toast.success('Complaint updated!', {
        duration: 3000,
        icon: '✏️',
      })
      // Update local state
      setLocalComplaints(prev => 
        prev.map(complaint => 
          complaint.id === data.data.id ? { ...complaint, ...data.data } : complaint
        )
      )
    })

    const unsubscribeDeleted = onComplaintDeleted((data) => {
      console.log('📥 Received complaint.deleted event:', data)
      toast.success('Complaint deleted!', {
        duration: 3000,
        icon: '🗑️',
      })
      // Remove from local state
      setLocalComplaints(prev => 
        prev.filter(complaint => complaint.id !== data.data.id)
      )
    })

    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeDeleted()
    }
  }, [onComplaintCreated, onComplaintUpdated, onComplaintDeleted, onUpdate])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPriorityFilter('')
    setCategoryFilter('')
  }

  const handleEdit = (complaint: any) => {
    setComplaintToEdit(complaint)
    setShowEditModal(true)
  }

  const handleEditSuccess = () => {
    onUpdate()
    setShowEditModal(false)
    setComplaintToEdit(null)
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No complaints found.</p>
      </div>
    )
  }

  return (
    <>
      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        {/* WebSocket Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Real-time updates connected' : 'Real-time updates disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SECURITY">Security</option>
              <option value="CLEANING">Cleaning</option>
              <option value="NOISE">Noise</option>
              <option value="OTHER">Other</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredComplaints.length)} of {filteredComplaints.length} complaints
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {paginatedComplaints.map((complaint) => (
            <li key={complaint.id}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {complaint.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${getStatusBadge(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={`badge ${getPriorityBadge(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                        {/* Inline upload & attachments actions */}
                        <input id={`file-${complaint.id}`} type="file" className="hidden" onChange={(e) => onInlineFileChange(complaint.id, e)} />
                        <button
                          onClick={() => triggerFilePicker(complaint.id)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          disabled={uploadingId === complaint.id}
                          title="Upload attachment"
                        >
                          {uploadingId === complaint.id ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                          onClick={() => toggleAttachments(complaint.id)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          title="Show attachments"
                        >
                          {openAttachmentsId === complaint.id ? 'Hide Files' : 'Files'}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {complaint.description}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>By {complaint.author?.email}</span>
                      <span className="mx-2">•</span>
                      <span>{complaint.apartment} - {complaint.building}</span>
                      <span className="mx-2">•</span>
                      <span>{format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    {openAttachmentsId === complaint.id && (
                      <div className="mt-3 bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-600 mb-2">Attachments</div>
                        <ul className="space-y-1">
                          {(attachmentsByComplaint[complaint.id] || []).length === 0 && (
                            <li className="text-sm text-gray-500">No attachments</li>
                          )}
                          {(attachmentsByComplaint[complaint.id] || []).map((a: any) => (
                            <li key={a.id} className="flex items-center justify-between text-sm">
                              <button onClick={() => downloadFile(a.url, a.fileName)} className="text-primary-600 truncate text-left">
                                {a.fileName}
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await complaintsApi.deleteAttachment(complaint.id, a.id)
                                    setAttachmentsByComplaint(prev => ({
                                      ...prev,
                                      [complaint.id]: (prev[complaint.id] || []).filter((x: any) => x.id !== a.id),
                                    }))
                                    toast.success('Deleted')
                                  } catch (e: any) {
                                    toast.error(e.response?.data?.message || 'Delete failed')
                                  }
                                }}
                                className="text-red-500"
                              >
                                Delete
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedComplaint(complaint)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint)
                        setShowCommentModal(true)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                    </button>
                    {(userRole === 'ADMIN' || (userRole === 'RESIDENT' && complaint.authorId === currentUserId)) && (
                      <>
                    <button
                      onClick={() => handleEdit(complaint)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit Complaint"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                        <button
                          onClick={() => confirmDelete(complaint)}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredComplaints.length)}</span> of{' '}
                <span className="font-medium">{filteredComplaints.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedComplaint && !showCommentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Complaint Details
                </h3>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedComplaint.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedComplaint.status)}`}>
                      {selectedComplaint.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedComplaint.category}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apartment</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedComplaint.apartment} - {selectedComplaint.building}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted By</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedComplaint.author?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">{format(new Date(selectedComplaint.createdAt), 'PPP p')}</p>
                </div>
                
                {selectedComplaint.updatedAt !== selectedComplaint.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">{format(new Date(selectedComplaint.updatedAt), 'PPP p')}</p>
                  </div>
                )}
                
                {selectedComplaint.comments && selectedComplaint.comments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comments ({selectedComplaint.comments.length})</label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {selectedComplaint.comments.map((comment: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-gray-900">{comment.content}</p>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">By {comment.author?.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Attachments</label>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                      <button onClick={handleUpload} disabled={!selectedFile || uploading} className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                      {(!selectedComplaint || (attachmentsByComplaint[selectedComplaint.id] || []).length === 0) && <li className="text-sm text-gray-500">No attachments</li>}
                      {(selectedComplaint ? (attachmentsByComplaint[selectedComplaint.id] || []) : []).map((a: any) => (
                        <li key={a.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-700 truncate">{a.fileName} <span className="text-xs text-gray-400">({Math.round((a.fileSize || 0)/1024)} KB)</span></div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => downloadFile(a.url, a.fileName)} className="text-primary-600 text-sm">Download</button>
                            {(userRole === 'ADMIN' || (userRole === 'RESIDENT' && selectedComplaint?.authorId === currentUserId)) && (
                              <button onClick={() => handleDeleteAttachment(a.id)} className="text-red-500 text-sm">Delete</button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowCommentModal(true)
                  }}
                  className="btn btn-primary"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Comment
              </h3>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Enter your comment..."
              />
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => {
                    setShowCommentModal(false)
                    setCommentText('')
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddComment(selectedComplaint.id)}
                  disabled={!commentText.trim()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Complaint
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this complaint? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && complaintToEdit && (
        <EditComplaintForm
          complaint={complaintToEdit}
          onClose={() => {
            setShowEditModal(false)
            setComplaintToEdit(null)
          }}
          onSuccess={handleEditSuccess}
          userRole={userRole}
        />
      )}
    </>
  )
}
