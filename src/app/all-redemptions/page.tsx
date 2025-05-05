'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  FilterFn,
} from '@tanstack/react-table';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getAllRedemptions, deleteRedemption, updateRedemption } from '@/services/redemptionService';
import { addNotification } from '@/services/notificationService';
import { Redemption } from '@/types';

export default function AllRedemptions() {
  const router = useRouter();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  useEffect(() => {
    const fetchRedemptions = async () => {
      try {
        setLoading(true);
        const allRedemptions = await getAllRedemptions();
        setRedemptions(allRedemptions);
        setError(null);
      } catch (err) {
        setError('Failed to fetch redemptions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRedemptions();
  }, []);
  
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteRedemption(id);
        await addNotification(`Redemption deleted: ${name}`);
        setRedemptions(redemptions.filter(redemption => redemption.id !== id));
      } catch (err) {
        console.error('Error deleting redemption:', err);
        setError('Failed to delete redemption. Please try again.');
      }
    }
  };
  
  const handleCellEdit = async (id: string, field: string, value: string) => {
    try {
      const updatedData = { [field]: value };
      await updateRedemption(id, updatedData);
      
      setRedemptions(prevRedemptions => 
        prevRedemptions.map(redemption => 
          redemption.id === id ? { ...redemption, [field]: value } : redemption
        )
      );
    } catch (err) {
      console.error('Error updating redemption:', err);
      setError('Failed to update redemption. Please try again.');
    }
  };
  
  const columnHelper = createColumnHelper<Redemption>();
  
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <div className="editable-cell" onBlur={(e) => handleCellEdit(info.row.original.id, 'name', e.currentTarget.textContent || '')}>
          <div 
            contentEditable 
            suppressContentEditableWarning
            className="focus:outline-none focus:bg-gray-100 p-1 rounded"
          >
            {info.getValue()}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('month', {
      header: 'Month',
      cell: info => (
        <div className="editable-cell" onBlur={(e) => handleCellEdit(info.row.original.id, 'month', e.currentTarget.textContent || '')}>
          <div 
            contentEditable 
            suppressContentEditableWarning
            className="focus:outline-none focus:bg-gray-100 p-1 rounded"
          >
            {info.getValue()}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('dateFrom', {
      header: 'From',
      cell: info => (
        <div className="editable-cell" onBlur={(e) => handleCellEdit(info.row.original.id, 'dateFrom', e.currentTarget.textContent || '')}>
          <div 
            contentEditable 
            suppressContentEditableWarning
            className="focus:outline-none focus:bg-gray-100 p-1 rounded"
          >
            {info.getValue()}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('dateTo', {
      header: 'To',
      cell: info => (
        <div className="editable-cell" onBlur={(e) => handleCellEdit(info.row.original.id, 'dateTo', e.currentTarget.textContent || '')}>
          <div 
            contentEditable 
            suppressContentEditableWarning
            className="focus:outline-none focus:bg-gray-100 p-1 rounded"
          >
            {info.getValue()}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('perks', {
      header: 'Perks',
      cell: info => (
        <div className="editable-cell" onBlur={(e) => handleCellEdit(info.row.original.id, 'perks', e.currentTarget.textContent || '')}>
          <div 
            contentEditable 
            suppressContentEditableWarning
            className="focus:outline-none focus:bg-gray-100 p-1 rounded max-w-xs truncate"
          >
            {info.getValue()}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const statuses: Array<'To Redeem' | 'Redeemed' | 'Expired'> = ['To Redeem', 'Redeemed', 'Expired'];
        return (
          <select
            value={info.getValue()}
            onChange={(e) => handleCellEdit(info.row.original.id, 'status', e.target.value)}
            className={`
              text-sm font-medium rounded-full px-3 py-1
              ${info.getValue() === 'Redeemed' ? 'bg-green-100 text-green-800' : ''}
              ${info.getValue() === 'To Redeem' ? 'bg-blue-100 text-blue-800' : ''}
              ${info.getValue() === 'Expired' ? 'bg-gray-100 text-gray-800' : ''}
            `}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleDelete(info.row.original.id, info.row.original.name)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    }),
  ], []);
  
  const table = useReactTable({
    data: redemptions,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Redemptions</h1>
        <Link
          href="/add-redemption"
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add New Redemption
        </Link>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search redemptions..."
          className="shadow appearance-none border rounded w-full md:w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <div className="overflow-x-auto shadow-md rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 