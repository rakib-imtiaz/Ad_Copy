'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TokenPrice {
  id: string;
  tokenType: string;
  currentPrice: number;
  previousPrice: number;
  lastUpdated: string;
  status: 'active' | 'inactive';
}

const mockTokenPrices: TokenPrice[] = [
  {
    id: '1',
    tokenType: 'Standard Token',
    currentPrice: 0.05,
    previousPrice: 0.04,
    lastUpdated: '2024-01-15 10:30 AM',
    status: 'active'
  },
  {
    id: '2',
    tokenType: 'Premium Token',
    currentPrice: 0.10,
    previousPrice: 0.12,
    lastUpdated: '2024-01-14 02:15 PM',
    status: 'active'
  },
  {
    id: '3',
    tokenType: 'Enterprise Token',
    currentPrice: 0.08,
    previousPrice: 0.08,
    lastUpdated: '2024-01-10 09:45 AM',
    status: 'active'
  }
];

export default function TokensPage() {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>(mockTokenPrices);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenPrice | null>(null);

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement price update logic
    setShowPriceForm(false);
    setSelectedToken(null);
  };

  const getPriceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: change,
      isPositive: change >= 0
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1 
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Token Pricing Management
        </motion.h1>
        <Button 
          onClick={() => setShowPriceForm(true)}
          className="flex items-center space-x-2"
        >
          <Settings size={20} />
          <span>Set Token Price</span>
        </Button>
      </div>

      {/* Price Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tokenPrices.map((token) => {
          const priceChange = getPriceChange(token.currentPrice, token.previousPrice);
          return (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{token.tokenType}</h3>
                  <p className="text-sm text-gray-500">Current Price</p>
                </div>
                <div className={`p-2 rounded-lg ${
                  priceChange.isPositive ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {priceChange.isPositive ? (
                    <TrendingUp size={20} className="text-green-600" />
                  ) : (
                    <TrendingDown size={20} className="text-red-600" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    ${token.currentPrice.toFixed(2)}
                  </span>
                  <span className={`text-sm font-medium ${
                    priceChange.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {priceChange.isPositive ? '+' : ''}{priceChange.value.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Previous: ${token.previousPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Updated: {token.lastUpdated}
                </p>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedToken(token);
                    setShowPriceForm(true);
                  }}
                  className="flex items-center space-x-1"
                >
                  <Settings size={16} />
                  <span>Update</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <Eye size={16} />
                  <span>View History</span>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Set Token Price Form */}
      {showPriceForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedToken ? `Update ${selectedToken.tokenType} Price` : 'Set New Token Price'}
          </h2>
          <form onSubmit={handleUpdatePrice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Type
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  defaultValue={selectedToken?.tokenType || ''}
                  required
                >
                  <option value="">Select Token Type</option>
                  <option value="Standard Token">Standard Token</option>
                  <option value="Premium Token">Premium Token</option>
                  <option value="Enterprise Token">Enterprise Token</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD)
                </label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.05" 
                  defaultValue={selectedToken?.currentPrice || ''}
                  required 
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit">
                {selectedToken ? 'Update Price' : 'Set Price'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowPriceForm(false);
                  setSelectedToken(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Price History Table */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Price History</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Token Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Change</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {tokenPrices.map((token) => {
                  const priceChange = getPriceChange(token.currentPrice, token.previousPrice);
                  return (
                    <tr key={token.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{token.tokenType}</td>
                      <td className="py-3 px-4 font-medium">${token.currentPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`flex items-center space-x-1 ${
                          priceChange.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {priceChange.isPositive ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                          <span>{priceChange.value.toFixed(1)}%</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{token.lastUpdated}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          token.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {token.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
