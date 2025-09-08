'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { complaintsApi } from '@/lib/api'
import toast from 'react-hot-toast'

const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['MAINTENANCE', 'SECURITY', 'CLEANING', 'NOISE', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  apartment: z.string().min(1, 'Apartment is required'),
  building: z.string().min(1, 'Building is required'),
})

type ComplaintFormData = z.infer<typeof complaintSchema>

interface ComplaintFormProps {
  onSuccess: () => void
}

export default function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  })

  const onSubmit = async (data: ComplaintFormData) => {
    setIsLoading(true)
    try {
      await complaintsApi.create(data)
      toast.success('Complaint created successfully!')
      reset()
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create complaint')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            {...register('title')}
            type="text"
            className="mt-1 input"
            placeholder="Brief description of the issue"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            {...register('category')}
            className="mt-1 input"
          >
            <option value="">Select a category</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="SECURITY">Security</option>
            <option value="CLEANING">Cleaning</option>
            <option value="NOISE">Noise</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            {...register('priority')}
            className="mt-1 input"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
              Apartment *
            </label>
            <input
              {...register('apartment')}
              type="text"
              className="mt-1 input"
              placeholder="e.g., A101"
            />
            {errors.apartment && (
              <p className="mt-1 text-sm text-red-600">{errors.apartment.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="building" className="block text-sm font-medium text-gray-700">
              Building *
            </label>
            <select
              {...register('building')}
              className="mt-1 input"
            >
              <option value="">Select building</option>
              <option value="A">Building A</option>
              <option value="B">Building B</option>
              <option value="C">Building C</option>
            </select>
            {errors.building && (
              <p className="mt-1 text-sm text-red-600">{errors.building.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={6}
            className="mt-1 input"
            placeholder="Please provide detailed information about the issue..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-secondary"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Complaint'}
          </button>
        </div>
      </form>
    </div>
  )
}
