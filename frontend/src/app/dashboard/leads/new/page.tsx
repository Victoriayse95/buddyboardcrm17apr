'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { addLead } from '@/lib/leadStorage';
import LoadingSpinner from '@/components/LoadingSpinner';

interface FormData {
  customer_name: string;
  customer_contact: string;
  customer_address: string;
  provider_name: string;
  provider_contact: string;
  service_start_date: string;
  service_end_date: string;
  service_start_time: string;
  service_end_time: string;
  notes?: string;
  total_price: number;
}

const schema = yup.object().shape({
  // Customer Information
  customer_name: yup.string().required('Customer name is required'),
  customer_contact: yup.string().required('Customer contact is required'),
  customer_address: yup.string().required('Customer address is required'),
  
  // Service Provider Information
  provider_name: yup.string().required('Provider name is required'),
  provider_contact: yup.string().required('Provider contact is required'),
  
  // Service Information
  service_start_date: yup.string().required('Start date is required'),
  service_end_date: yup.string().required('End date is required'),
  service_start_time: yup.string().required('Start time is required'),
  service_end_time: yup.string().required('End time is required'),
  notes: yup.string().optional(),
  total_price: yup.number().required('Total price is required').positive('Price must be positive'),
});

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      // Add the new lead to Firestore
      const newLead = await addLead({
        customer_name: data.customer_name,
        customer_contact: data.customer_contact,
        service_provider_name: data.provider_name,
        service_provider_contact: data.provider_contact,
        service_start_date: data.service_start_date,
        service_end_date: data.service_end_date,
        service_start_time: data.service_start_time,
        service_end_time: data.service_end_time,
        notes: data.notes || "",
        total_price: data.total_price
      });
      
      if (!newLead) {
        throw new Error('Failed to create lead');
      }
      
      toast.success('New lead created successfully');
      router.push('/dashboard/leads'); // Redirect to All Leads page instead of dashboard
    } catch (error) {
      console.error('Error creating new lead:', error);
      toast.error('Failed to create new lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitButtonContent = loading ? (
    <div className="flex items-center justify-center">
      <LoadingSpinner size="sm" />
      <span className="ml-2">Creating...</span>
    </div>
  ) : (
    'Create Lead'
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Lead</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Fill in the details to create a new customer lead.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-6">
              {/* Customer Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Customer Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register('customer_name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.customer_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="customer_contact" className="block text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      {...register('customer_contact')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.customer_contact && (
                      <p className="mt-1 text-sm text-red-600">{errors.customer_contact.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="customer_address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      {...register('customer_address')}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.customer_address && (
                      <p className="mt-1 text-sm text-red-600">{errors.customer_address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Provider Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Service Provider Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700">
                      Provider Name
                    </label>
                    <input
                      type="text"
                      {...register('provider_name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.provider_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.provider_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="provider_contact" className="block text-sm font-medium text-gray-700">
                      Provider Contact
                    </label>
                    <input
                      type="text"
                      {...register('provider_contact')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.provider_contact && (
                      <p className="mt-1 text-sm text-red-600">{errors.provider_contact.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-4">Service Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="service_start_date" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register('service_start_date')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.service_start_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.service_start_date.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="service_end_date" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register('service_end_date')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.service_end_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.service_end_date.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="service_start_time" className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      {...register('service_start_time')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.service_start_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.service_start_time.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="service_end_time" className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      {...register('service_end_time')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.service_end_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.service_end_time.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.notes && (
                      <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="total_price" className="block text-sm font-medium text-gray-700">
                      Total Price
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        {...register('total_price')}
                        className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    {errors.total_price && (
                      <p className="mt-1 text-sm text-red-600">{errors.total_price.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitButtonContent}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 