'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { residentsApi } from '@/lib/api'
import toast from 'react-hot-toast'

const residentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  apartment: z.string().min(1, 'Apartment is required'),
  floor: z.number().min(1, 'Floor must be at least 1'),
  building: z.string().min(1, 'Building is required'),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  isOwner: z.boolean(),
})

type ResidentFormData = z.infer<typeof residentSchema>

interface ResidentFormProps {
  onSuccess: () => void
}

export default function ResidentForm({ onSuccess }: ResidentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      isOwner: false,
      floor: 1,
    },
  })

  const onSubmit = async (data: ResidentFormData) => {
    setIsLoading(true)
    try {
      await residentsApi.create(data)
      toast.success('Resident created successfully!')
      reset()
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create resident')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              className="mt-1 input"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              className="mt-1 input"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="mt-1 input"
            placeholder="+84901234567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
              Apartment *
            </label>
            <input
              {...register('apartment')}
              type="text"
              className="mt-1 input"
              placeholder="A101"
            />
            {errors.apartment && (
              <p className="mt-1 text-sm text-red-600">{errors.apartment.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
              Floor *
            </label>
            <input
              {...register('floor', { valueAsNumber: true })}
              type="number"
              min="1"
              className="mt-1 input"
              placeholder="1"
            />
            {errors.floor && (
              <p className="mt-1 text-sm text-red-600">{errors.floor.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="building" className="block text-sm font-medium text-gray-700">
              Building *
            </label>
            <input
              {...register('building')}
              type="text"
              className="mt-1 input"
              placeholder="Building A"
            />
            {errors.building && (
              <p className="mt-1 text-sm text-red-600">{errors.building.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="moveInDate" className="block text-sm font-medium text-gray-700">
            Move-in Date *
          </label>
          <input
            {...register('moveInDate')}
            type="date"
            className="mt-1 input"
          />
          {errors.moveInDate && (
            <p className="mt-1 text-sm text-red-600">{errors.moveInDate.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            {...register('isOwner')}
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isOwner" className="ml-2 block text-sm text-gray-900">
            Property Owner
          </label>
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
            {isLoading ? 'Creating...' : 'Create Resident'}
          </button>
        </div>
      </form>
    </div>
  )
}
