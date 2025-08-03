'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Bot, BarChart2 } from 'lucide-react';

const mockUsageData = {
  totalUsers: 1250,
  approvedDrafts: 8942,
  activeAgents: 58,
  apiUsage: '1.2M',
  activeUsers: [
    { id: 1, name: 'John Doe', email: 'john.d@example.com', drafts: 250 },
    { id: 2, name: 'Jane Smith', email: 'jane.s@example.com', drafts: 180 },
    { id: 3, name: 'Sam Wilson', email: 'sam.w@example.com', drafts: 150 },
  ],
  popularAgents: [
    { id: 1, name: 'Google Ads - Headline Generator', runs: 1200 },
    { id: 2, name: 'Instagram Post - Caption Writer', runs: 950 },
    { id: 3, name: 'Facebook Ad - Primary Text', runs: 800 },
  ]
};

const UsageAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Usage & Analytics</h1>
              <p className="text-gray-500">A detailed breakdown of platform activity.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-500"/>
              <select className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-indigo-500">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
              </select>
            </div>
          </div>
          
          <div className="h-80 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center mb-12">
             <BarChart2 size={60} className="text-gray-300"/>
             <p className="ml-6 text-gray-400 text-lg">Detailed usage chart placeholder</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Users size={22} className="mr-3 text-gray-500"/>
                Most Active Users
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drafts Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockUsageData.activeUsers.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.drafts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
               <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bot size={22} className="mr-3 text-gray-500"/>
                Most Popular Agents
              </h2>
              <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Runs</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockUsageData.popularAgents.map(agent => (
                      <tr key={agent.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.runs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageAnalyticsPage;

