'use client'

import { useState, useEffect, useMemo } from 'react'
import { PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { residentsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import EditResidentForm from './EditResidentForm'

interface ResidentsListProps {
  residents: any[]
  onUpdate: () => void
  userRole: string
  currentUserId: string
}

export default function ResidentsList({ residents, onUpdate, userRole, currentUserId }: ResidentsListProps) {
  const [selectedResident, setSelectedResident] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [residentToDelete, setResidentToDelete] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [residentToEdit, setResidentToEdit] = useState<any>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const handleDelete = async (id: string) => {
    try {
      await residentsApi.delete(id)
      toast.success('Resident deleted successfully')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete resident')
    }
  }

  const confirmDelete = (resident: any) => {
    setResidentToDelete(resident)
    setShowDeleteModal(true)
  }

  const executeDelete = async () => {
    if (residentToDelete) {
      await handleDelete(residentToDelete.id)
      setShowDeleteModal(false)
      setResidentToDelete(null)
    }
  }

  const handleExportCsv = async () => {
    try {
      const res = await residentsApi.exportCsv()
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `residents_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Exported residents CSV')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to export CSV')
    }
  }

  // Filter and search logic
  const filteredResidents = useMemo(() => {
    return residents.filter(resident => {
      const matchesSearch = resident.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resident.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resident.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resident.phone.includes(searchTerm)
      
      const matchesBuilding = !buildingFilter || resident.building === buildingFilter
      const matchesOwner = ownerFilter === '' || (ownerFilter === 'owner' && resident.isOwner) || (ownerFilter === 'tenant' && !resident.isOwner)

      return matchesSearch && matchesBuilding && matchesOwner
    })
  }, [residents, searchTerm, buildingFilter, ownerFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedResidents = filteredResidents.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, buildingFilter, ownerFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setBuildingFilter('')
    setOwnerFilter('')
  }

  const handleEdit = (resident: any) => {
    setResidentToEdit(resident)
    setShowEditModal(true)
  }

  const handleEditSuccess = () => {
    onUpdate()
    setShowEditModal(false)
    setResidentToEdit(null)
  }

  if (residents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No residents found.</p>
      </div>
    )
  }

  return (
    <>
      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search residents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Buildings</option>
              <option value="A">Building A</option>
              <option value="B">Building B</option>
              <option value="C">Building C</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="owner">Owners</option>
              <option value="tenant">Tenants</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>

            <button
              onClick={handleExportCsv}
              className="ml-auto px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredResidents.length)} of {filteredResidents.length} residents
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {paginatedResidents.map((resident) => (
            <li key={resident.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {resident.firstName[0]}{resident.lastName[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {resident.firstName} {resident.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {resident.apartment} - {resident.building}
                    </div>
                    <div className="text-sm text-gray-500">
                      {resident.phone} • {resident.isOwner ? 'Owner' : 'Tenant'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-medium">
                    {resident._count?.complaints || 0} complaints
                  </span>
                  <button
                    onClick={() => setSelectedResident(resident)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                    <>
                      <button
                        onClick={() => handleEdit(resident)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Edit Resident"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(resident)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
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
                <span className="font-medium">{Math.min(endIndex, filteredResidents.length)}</span> of{' '}
                <span className="font-medium">{filteredResidents.length}</span> results
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
      {selectedResident && !showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Resident Details
                </h3>
                <button
                  onClick={() => setSelectedResident(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-xl">
                      {selectedResident.firstName[0]}{selectedResident.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedResident.firstName} {selectedResident.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedResident.isOwner ? 'Owner' : 'Tenant'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResident.phone}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResident.user?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apartment</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResident.apartment}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Floor</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResident.floor}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Building</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedResident.building}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Move-in Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedResident.moveInDate ? format(new Date(selectedResident.moveInDate), 'PPP') : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedResident.user?.role}</p>
                </div>
                
                {selectedResident.familyMembers && selectedResident.familyMembers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Family Members ({selectedResident.familyMembers.length})</label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {selectedResident.familyMembers.map((member: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-gray-600">{member.relationship}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {member.phone}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Complaints</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedResident._count?.complaints || 0}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedResident(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                <button
                  onClick={() => {
                    setSelectedResident(null)
                    handleEdit(selectedResident)
                  }}
                  className="btn btn-primary"
                >
                  Edit Resident
                </button>
                )}
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
                Delete Resident
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete {residentToDelete?.firstName} {residentToDelete?.lastName}? 
                This action cannot be undone.
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
      {showEditModal && residentToEdit && (
        <EditResidentForm
          resident={residentToEdit}
          onClose={() => {
            setShowEditModal(false)
            setResidentToEdit(null)
          }}
          onSuccess={handleEditSuccess}
          userRole={userRole}
        />
      )}
    </>
  )
}
