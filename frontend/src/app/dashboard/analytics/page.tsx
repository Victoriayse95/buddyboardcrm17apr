'use client';

import { useState, useEffect } from 'react';
import { getLeads, Lead } from '@/lib/leadStorage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { formatDateDDMMYYYY } from '@/utils/format';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
);

// Time period options for filtering
type TimePeriod = 'all' | 'month' | 'quarter' | 'year';

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Define stats state
  const [totalSales, setTotalSales] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [upcomingServices, setUpcomingServices] = useState(0);
  const [cancellationRate, setCancellationRate] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{labels: string[], data: number[]}>({labels: [], data: []});
  const [statusDistribution, setStatusDistribution] = useState<{labels: string[], data: number[]}>({labels: [], data: []});

  // Fetch leads data
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedLeads = await getLeads();
        setLeads(fetchedLeads);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads. Please try again later.');
        setLoading(false);
        toast.error('Failed to load analytics data');
      }
    };

    fetchLeads();
  }, [refreshTrigger]);

  // Calculate statistics when leads data changes or time period changes
  useEffect(() => {
    if (leads.length === 0) return;

    // Filter leads based on selected time period
    const filteredLeads = filterLeadsByTimePeriod(leads, timePeriod);
    
    // Calculate total sales (sum of total_price for all leads)
    const totalSalesValue = filteredLeads.reduce((sum, lead) => sum + (lead.total_price || 0), 0);
    setTotalSales(totalSalesValue);
    
    // Calculate completed services (count of leads with status "Completed")
    const completedServicesCount = filteredLeads.filter(lead => lead.status === "Completed").length;
    setCompletedServices(completedServicesCount);
    
    // Calculate upcoming services (count of leads with future service_start_date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingServicesCount = filteredLeads.filter(lead => {
      const serviceDate = new Date(lead.service_start_date);
      return serviceDate >= today && lead.status !== "Cancelled" && lead.status !== "Completed";
    }).length;
    setUpcomingServices(upcomingServicesCount);
    
    // Calculate cancellation rate (cancelled leads / total leads) * 100
    const cancelledLeadsCount = filteredLeads.filter(lead => lead.status === "Cancelled").length;
    const cancellationRateValue = filteredLeads.length > 0 
      ? (cancelledLeadsCount / filteredLeads.length) * 100 
      : 0;
    setCancellationRate(cancellationRateValue);

    // Generate monthly revenue data for the chart
    const monthlyRevenueData = generateMonthlyRevenueData(filteredLeads);
    setMonthlyRevenue(monthlyRevenueData);

    // Generate status distribution data for pie chart
    const statusDistributionData = generateStatusDistributionData(filteredLeads);
    setStatusDistribution(statusDistributionData);

  }, [leads, timePeriod]);

  // Filter leads based on time period
  const filterLeadsByTimePeriod = (leads: Lead[], period: TimePeriod): Lead[] => {
    if (period === 'all') return leads;
    
    const today = new Date();
    const startDate = new Date();
    
    switch(period) {
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }
    
    return leads.filter(lead => {
      const serviceDate = new Date(lead.service_start_date);
      return serviceDate >= startDate;
    });
  };

  // Generate monthly revenue data
  const generateMonthlyRevenueData = (leads: Lead[]) => {
    const months: { [key: string]: number } = {};
    const today = new Date();
    
    // Setup last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short', year: 'numeric' });
      months[monthKey] = 0;
    }
    
    // Sum up revenue by month
    leads.forEach(lead => {
      if (lead.status === "Completed") {
        const serviceDate = new Date(lead.service_start_date);
        const monthKey = serviceDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (months[monthKey] !== undefined) {
          months[monthKey] += (lead.total_price || 0);
        }
      }
    });
    
    return {
      labels: Object.keys(months),
      data: Object.values(months)
    };
  };

  // Generate status distribution data
  const generateStatusDistributionData = (leads: Lead[]) => {
    const statusCounts: { [key: string]: number } = {};
    
    leads.forEach(lead => {
      const status = lead.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return {
      labels: Object.keys(statusCounts),
      data: Object.values(statusCounts)
    };
  };

  // Function to refresh data
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Refreshing analytics data...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with time period selector */}
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Key performance metrics and statistics for your business
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex-none flex space-x-3">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Time</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key metrics cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Sales */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${totalSales.toFixed(2)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <span className="font-medium text-indigo-600 hover:text-indigo-900">
                  From {timePeriod === 'all' ? 'all time' : `last ${timePeriod}`}
                </span>
              </div>
            </div>
          </div>

          {/* Completed Services */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Completed Services</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{completedServices}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <span className="font-medium text-green-600 hover:text-green-900">
                  {completedServices > 0 ? `${Math.round((completedServices / leads.length) * 100)}% completion rate` : 'No completed services'}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Services */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Services</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{upcomingServices}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <span className="font-medium text-blue-600 hover:text-blue-900">
                  Future scheduled services
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Rate */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Cancellation Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{cancellationRate.toFixed(1)}%</dd>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <span className={`font-medium ${cancellationRate > 10 ? 'text-red-600' : 'text-orange-600'}`}>
                  {cancellationRate > 10 ? 'High cancellation rate' : 'Normal cancellation rate'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h2>
            <div className="h-80">
              <Bar 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Revenue ($)'
                      }
                    }
                  }
                }}
                data={{
                  labels: monthlyRevenue.labels,
                  datasets: [
                    {
                      label: 'Revenue',
                      data: monthlyRevenue.data,
                      backgroundColor: 'rgba(79, 70, 229, 0.7)',
                    },
                  ],
                }}
              />
            </div>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h2>
            <div className="h-80 flex items-center justify-center">
              <Pie
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }}
                data={{
                  labels: statusDistribution.labels,
                  datasets: [
                    {
                      label: 'Count',
                      data: statusDistribution.data,
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>

        {/* Upcoming Services List */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Next 7 Days Upcoming Services</h2>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Customer</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service Provider</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {getUpcomingLeadsForNext7Days(leads).map((lead) => (
                  <tr key={lead.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{lead.customer_name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.service_provider_name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDateDDMMYYYY(lead.service_start_date)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${lead.total_price.toFixed(2)}</td>
                  </tr>
                ))}
                {getUpcomingLeadsForNext7Days(leads).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-sm text-gray-500 text-center">No upcoming services in the next 7 days</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get upcoming leads for the next 7 days
function getUpcomingLeadsForNext7Days(leads: Lead[]): Lead[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);
  
  return leads
    .filter(lead => {
      const serviceDate = new Date(lead.service_start_date);
      serviceDate.setHours(0, 0, 0, 0);
      return serviceDate >= today && serviceDate <= next7Days && lead.status !== "Cancelled" && lead.status !== "Completed";
    })
    .sort((a, b) => new Date(a.service_start_date).getTime() - new Date(b.service_start_date).getTime());
}

// Helper function to get status color
function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Pending Service':
      return 'bg-yellow-100 text-yellow-800';
    case 'Service In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Send Reminder':
      return 'bg-indigo-100 text-indigo-800';
    case 'Reminder Sent':
      return 'bg-purple-100 text-purple-800';
    case 'To Reschedule':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 