'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Settings, RefreshCw, BarChart3, Calendar, Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth-service';

interface TokenPrice {
  service: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  status: 'up' | 'down' | 'stable';
}

// Interface for API response
interface ApiTokenPriceItem {
  service_name: string;
  price: string;
}

interface ApiTokenPrice extends Array<ApiTokenPriceItem> {}

interface TokenPriceForm {
  claude_input_token_price: string;
  claude_output_token_price: string;
  openai_embedding_token_price: string;
  rapidapi_token_price: string;
  elevenlabs_token_price: string;
}

interface PriceCalculation {
  service: string;
  perToken: number;
  perMillion: number;
  formattedPerMillion: string;
}

interface TokenStats {
  totalPerMillion: number;
  monthlyProjection: number;
  yearlyProjection: number;
  averagePerService: number;
  mostExpensiveService: string;
  leastExpensiveService: string;
  costBreakdown: Array<{service: string, percentage: number, cost: number}>;
}

export default function TokensPage() {
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [newPrices, setNewPrices] = useState<TokenPriceForm>({
    claude_input_token_price: '',
    claude_output_token_price: '',
    openai_embedding_token_price: '',
    rapidapi_token_price: '',
    elevenlabs_token_price: ''
  });

    // Calculate cost per million tokens for each service
  const calculatePerMillion = (): PriceCalculation[] => {
    const calculations: PriceCalculation[] = [];
    
    const services = [
      { key: 'claude_input_token_price', name: 'Claude Input' },
      { key: 'claude_output_token_price', name: 'Claude Output' },
      { key: 'openai_embedding_token_price', name: 'OpenAI Embedding' },
      { key: 'rapidapi_token_price', name: 'RapidAPI' },
      { key: 'elevenlabs_token_price', name: 'ElevenLabs' }
    ];

    services.forEach(service => {
      const price = parseFloat(newPrices[service.key as keyof TokenPriceForm]) || 0;
      const perMillion = price * 1000000;
      
      calculations.push({
        service: service.name,
        perToken: price,
        perMillion: perMillion,
        formattedPerMillion: perMillion > 0 ? `$${perMillion.toFixed(2)}` : '$0.00'
      });
    });

    return calculations;
  };

  // Calculate comprehensive statistics
  const calculateStats = (): TokenStats => {
    // Use the actual token prices from the API, not the form state
    const calculations: PriceCalculation[] = [];
    
    const services = [
      { key: 'claude_input_token_price', name: 'Claude Input' },
      { key: 'claude_output_token_price', name: 'Claude Output' },
      { key: 'openai_embedding_token_price', name: 'OpenAI Embedding' },
      { key: 'rapidapi_token_price', name: 'RapidAPI' },
      { key: 'elevenlabs_token_price', name: 'ElevenLabs' }
    ];

    // Map API token prices to calculations
    services.forEach(service => {
      const tokenPrice = tokenPrices.find(tp => tp.service === service.name);
      if (tokenPrice) {
        const perMillion = tokenPrice.currentPrice * 1000000;
        calculations.push({
          service: service.name,
          perToken: tokenPrice.currentPrice,
          perMillion: perMillion,
          formattedPerMillion: perMillion > 0 ? `$${perMillion.toFixed(2)}` : '$0.00'
        });
      }
    });

    const totalPerMillion = calculations.reduce((sum, calc) => sum + calc.perMillion, 0);
    
    // Monthly projection (assuming 10M tokens per month average usage)
    const monthlyTokens = 10000000;
    const monthlyProjection = (totalPerMillion / 1000000) * monthlyTokens;
    
    // Yearly projection
    const yearlyProjection = monthlyProjection * 12;
    
    // Average per service
    const averagePerService = totalPerMillion / calculations.length;
    
    // Most and least expensive services
    const sortedServices = [...calculations].sort((a, b) => b.perMillion - a.perMillion);
    const mostExpensiveService = sortedServices[0]?.service || 'N/A';
    const leastExpensiveService = sortedServices[sortedServices.length - 1]?.service || 'N/A';
    
    // Cost breakdown by percentage
    const costBreakdown = calculations.map(calc => ({
      service: calc.service,
      percentage: totalPerMillion > 0 ? (calc.perMillion / totalPerMillion) * 100 : 0,
      cost: calc.perMillion
    }));

    return {
      totalPerMillion,
      monthlyProjection,
      yearlyProjection,
      averagePerService,
      mostExpensiveService,
      leastExpensiveService,
      costBreakdown
    };
  };

  const handlePriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdatingPrices(true);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      console.log('💰 Client - Setting token prices');
      console.log('🔑 Client - Token exists:', !!token);

             // Create request body with only filled fields, null for empty ones
       const requestBody: any = {
         accessToken: token
       };

       // Only include fields that have values, set null for empty fields
       Object.keys(newPrices).forEach(key => {
         const value = newPrices[key as keyof TokenPriceForm];
         if (value && value.trim() !== '') {
           requestBody[key] = parseFloat(value);
         } else {
           requestBody[key] = null;
         }
       });

       const response = await fetch('/api/admin/set-token-price', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(requestBody),
       });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update token prices');
      }

      const result = await response.json();
      console.log('✅ Token prices updated successfully:', result);

             // Reset form and close
       setNewPrices({
         claude_input_token_price: '',
         claude_output_token_price: '',
         openai_embedding_token_price: '',
         rapidapi_token_price: '',
         elevenlabs_token_price: ''
       });
      setShowPriceForm(false);
      
      // Refresh token prices after update
      await fetchTokenPrices();
      alert('Token prices updated successfully!');
    } catch (error) {
      console.error('❌ Error updating token prices:', error);
      alert(`Failed to update token prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingPrices(false);
    }
  };

  const fetchTokenPrices = async () => {
    try {
      setLoading(true);
      const token = authService.getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      console.log('📊 Client - Fetching token prices');
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch(`/api/admin/get-token-price?accessToken=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch token prices');
      }

      const result = await response.json();
      console.log('✅ Token prices fetched successfully:', result);
      
             // Transform API data to match our interface
       if (result && Array.isArray(result)) {
         const apiData = result as ApiTokenPrice;
         const transformedPrices: TokenPrice[] = [];
         
         // Map API array items to our interface
         apiData.forEach((item) => {
           const price = parseFloat(item.price);
           if (!isNaN(price)) {
             // Map service names to display names
             let serviceName = item.service_name;
             switch (item.service_name) {
               case 'claude_input_token_price':
                 serviceName = 'Claude Input';
                 break;
               case 'claude_output_token_price':
                 serviceName = 'Claude Output';
                 break;
               case 'openai_embedding_token_price':
                 serviceName = 'OpenAI Embedding';
                 break;
               case 'rapidapi_token_price':
                 serviceName = 'RapidAPI';
                 break;
               case 'elevenlabs_token_price':
                 serviceName = 'ElevenLabs';
                 break;
               default:
                 serviceName = item.service_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
             }
             
             transformedPrices.push({
               service: serviceName,
               currentPrice: price,
               previousPrice: price, // No previous price in API, use current
               change: 0,
               status: 'stable'
             });
           }
         });
         
         setTokenPrices(transformedPrices);
      } else {
        console.error('❌ Invalid API response format:', result);
        // Fallback to mock data if API response is invalid
        setTokenPrices([
          {
            service: 'Claude Input',
            currentPrice: 0.000015,
            previousPrice: 0.000012,
            change: 25,
            status: 'up'
          },
          {
            service: 'Claude Output',
            currentPrice: 0.000075,
            previousPrice: 0.000075,
            change: 0,
            status: 'stable'
          },
          {
            service: 'OpenAI Embedding',
            currentPrice: 0.00006,
            previousPrice: 0.00008,
            change: -25,
            status: 'down'
          },
          {
            service: 'RapidAPI',
            currentPrice: 0.0001,
            previousPrice: 0.0001,
            change: 0,
            status: 'stable'
          }
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching token prices:', error);
      // Fallback to mock data on error
      setTokenPrices([
        {
          service: 'Claude Input',
          currentPrice: 0.000015,
          previousPrice: 0.000012,
          change: 25,
          status: 'up'
        },
        {
          service: 'Claude Output',
          currentPrice: 0.000075,
          previousPrice: 0.000075,
          change: 0,
          status: 'stable'
        },
        {
          service: 'OpenAI Embedding',
          currentPrice: 0.00006,
          previousPrice: 0.00008,
          change: -25,
          status: 'down'
        },
        {
          service: 'RapidAPI',
          currentPrice: 0.0001,
          previousPrice: 0.0001,
          change: 0,
          status: 'stable'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenPrices();
  }, []);

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
        <div className="flex space-x-3">
          <Button 
            onClick={fetchTokenPrices}
            disabled={loading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
          <Button 
            onClick={() => setShowPriceForm(true)}
            className="flex items-center space-x-2"
          >
            <Settings size={20} />
            <span>Set Token Prices</span>
          </Button>
        </div>
      </div>

      {/* Token Price Overview */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading token prices...</p>
          </div>
        </div>
      ) : tokenPrices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No token prices found. Click "Refresh" to load data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tokenPrices.map((price) => (
          <motion.div
            key={price.service}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{price.service}</h3>
              <div className={`p-2 rounded-full ${
                price.status === 'up' ? 'bg-green-100 text-green-600' :
                price.status === 'down' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {price.status === 'up' ? <TrendingUp size={16} /> :
                 price.status === 'down' ? <TrendingUp size={16} className="rotate-180" /> :
                 <DollarSign size={16} />}
              </div>
            </div>
                         <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-600">Current Price</span>
                 <span className="font-semibold text-gray-900">${Number(price.currentPrice).toFixed(8)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-600">Per 1M Tokens</span>
                 <span className="font-semibold text-blue-600">${(Number(price.currentPrice) * 1000000).toFixed(2)}</span>
               </div>
             </div>
           </motion.div>
         ))}
                 </div>
       )}

       {/* Statistics and Analytics */}
       {tokenPrices.length > 0 && (
         <div className="space-y-6">
           <motion.h2 
             className="text-xl font-semibold text-gray-900 flex items-center space-x-2"
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
           >
             <BarChart3 size={24} className="text-blue-600" />
             <span>Pricing Analytics & Projections</span>
           </motion.h2>

           {/* Key Metrics Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
             >
               <div className="flex items-center justify-between mb-4">
                 <div className="p-2 bg-blue-500 rounded-lg">
                   <DollarSign size={20} className="text-white" />
                 </div>
                 <span className="text-sm font-medium text-blue-700">Total per 1M</span>
               </div>
               <h3 className="text-2xl font-bold text-blue-900">
                 ${calculateStats().totalPerMillion.toFixed(2)}
               </h3>
               <p className="text-sm text-blue-600 mt-1">All services combined</p>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
             >
               <div className="flex items-center justify-between mb-4">
                 <div className="p-2 bg-green-500 rounded-lg">
                   <Calendar size={20} className="text-white" />
                 </div>
                 <span className="text-sm font-medium text-green-700">Monthly Projection</span>
               </div>
               <h3 className="text-2xl font-bold text-green-900">
                 ${calculateStats().monthlyProjection.toFixed(2)}
               </h3>
               <p className="text-sm text-green-600 mt-1">Based on 10M tokens/month</p>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
             >
               <div className="flex items-center justify-between mb-4">
                 <div className="p-2 bg-purple-500 rounded-lg">
                   <Activity size={20} className="text-white" />
                 </div>
                 <span className="text-sm font-medium text-purple-700">Yearly Projection</span>
               </div>
               <h3 className="text-2xl font-bold text-purple-900">
                 ${calculateStats().yearlyProjection.toFixed(2)}
               </h3>
               <p className="text-sm text-purple-600 mt-1">Annual cost estimate</p>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
             >
               <div className="flex items-center justify-between mb-4">
                 <div className="p-2 bg-orange-500 rounded-lg">
                   <Users size={20} className="text-white" />
                 </div>
                 <span className="text-sm font-medium text-orange-700">Avg per Service</span>
               </div>
               <h3 className="text-2xl font-bold text-orange-900">
                 ${calculateStats().averagePerService.toFixed(2)}
               </h3>
               <p className="text-sm text-orange-600 mt-1">Average cost per service</p>
             </motion.div>
           </div>

           {/* Cost Breakdown and Analysis */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Cost Breakdown */}
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
             >
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                 <BarChart3 size={20} className="text-blue-600" />
                 <span>Cost Breakdown (per 1M tokens)</span>
               </h3>
               <div className="space-y-3">
                 {calculateStats().costBreakdown.map((item, index) => (
                   <div key={item.service} className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <div className={`w-3 h-3 rounded-full ${
                         index === 0 ? 'bg-blue-500' :
                         index === 1 ? 'bg-green-500' :
                         index === 2 ? 'bg-purple-500' :
                         index === 3 ? 'bg-orange-500' :
                         'bg-red-500'
                       }`}></div>
                       <span className="text-sm font-medium text-gray-700">{item.service}</span>
                     </div>
                     <div className="text-right">
                       <div className="text-sm font-semibold text-gray-900">${item.cost.toFixed(2)}</div>
                       <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>

             {/* Service Analysis */}
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
             >
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                 <TrendingUp size={20} className="text-green-600" />
                 <span>Service Analysis</span>
               </h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <span className="text-sm font-medium text-green-700">Most Expensive</span>
                   </div>
                   <span className="text-sm font-semibold text-green-900">{calculateStats().mostExpensiveService}</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                     <span className="text-sm font-medium text-blue-700">Least Expensive</span>
                   </div>
                   <span className="text-sm font-semibold text-blue-900">{calculateStats().leastExpensiveService}</span>
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                   <div className="text-sm text-gray-600 mb-2">Usage Scenarios</div>
                   <div className="space-y-2 text-xs">
                     <div className="flex justify-between">
                       <span>Light Usage (1M tokens):</span>
                       <span className="font-medium">${calculateStats().totalPerMillion.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>Medium Usage (5M tokens):</span>
                       <span className="font-medium">${(calculateStats().totalPerMillion * 5).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>Heavy Usage (20M tokens):</span>
                       <span className="font-medium">${(calculateStats().totalPerMillion * 20).toFixed(2)}</span>
                     </div>
                   </div>
                 </div>
               </div>
             </motion.div>
           </div>
         </div>
       )}

      {/* Set New Prices Form */}
      {showPriceForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
                     <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-semibold text-gray-900">Set New Token Prices</h2>
             <div className="text-sm text-gray-500">Fill only the fields you want to update. Empty fields will be set to null.</div>
           </div>
                     <form onSubmit={handlePriceUpdate} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Claude Input Token Price ($)</label>
                                   <Input 
                    type="number" 
                    min="0" 
                    step="0.000000001"
                    placeholder="0.000015" 
                    value={newPrices.claude_input_token_price}
                    onChange={(e) => setNewPrices({...newPrices, claude_input_token_price: e.target.value})}
                    className="text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                 <p className="text-xs text-blue-600 font-medium mt-1">
                   💰 Per 1,000,000 tokens: {calculatePerMillion().find(c => c.service === 'Claude Input')?.formattedPerMillion}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Claude Output Token Price ($)</label>
                                   <Input 
                    type="number" 
                    min="0" 
                    step="0.000000001"
                    placeholder="0.000075" 
                    value={newPrices.claude_output_token_price}
                    onChange={(e) => setNewPrices({...newPrices, claude_output_token_price: e.target.value})}
                    className="text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                 <p className="text-xs text-blue-600 font-medium mt-1">
                   💰 Per 1,000,000 tokens: {calculatePerMillion().find(c => c.service === 'Claude Output')?.formattedPerMillion}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI Embedding Token Price ($)</label>
                                   <Input 
                    type="number" 
                    min="0" 
                    step="0.000000001"
                    placeholder="0.00006" 
                    value={newPrices.openai_embedding_token_price}
                    onChange={(e) => setNewPrices({...newPrices, openai_embedding_token_price: e.target.value})}
                    className="text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                 <p className="text-xs text-blue-600 font-medium mt-1">
                   💰 Per 1,000,000 tokens: {calculatePerMillion().find(c => c.service === 'OpenAI Embedding')?.formattedPerMillion}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">RapidAPI Token Price ($)</label>
                                   <Input 
                    type="number" 
                    min="0" 
                    step="0.000000001"
                    placeholder="0.0001" 
                    value={newPrices.rapidapi_token_price}
                    onChange={(e) => setNewPrices({...newPrices, rapidapi_token_price: e.target.value})}
                    className="text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                 <p className="text-xs text-blue-600 font-medium mt-1">
                   💰 Per 1,000,000 tokens: {calculatePerMillion().find(c => c.service === 'RapidAPI')?.formattedPerMillion}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">ElevenLabs Token Price ($)</label>
                                   <Input 
                    type="number" 
                    min="0" 
                    step="0.000000001"
                    placeholder="0.000012" 
                    value={newPrices.elevenlabs_token_price}
                    onChange={(e) => setNewPrices({...newPrices, elevenlabs_token_price: e.target.value})}
                    className="text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                 <p className="text-xs text-blue-600 font-medium mt-1">
                   💰 Per 1,000,000 tokens: {calculatePerMillion().find(c => c.service === 'ElevenLabs')?.formattedPerMillion}
                 </p>
               </div>
                          </div>
             
                           {/* Price Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">💰 Cost Per 1,000,000 Tokens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {calculatePerMillion().map((calc) => (
                    <div key={calc.service} className="flex justify-between items-center text-sm">
                      <span className="text-blue-700 font-medium">{calc.service}:</span>
                      <span className="text-blue-900 font-semibold">{calc.formattedPerMillion}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-700 font-medium">Total for 1,000,000 tokens (all services):</span>
                                         <span className="text-blue-900 font-bold">
                       ${calculatePerMillion().reduce((sum, calc) => sum + calc.perMillion, 0).toFixed(2)}
                     </span>
                  </div>
                </div>
              </div>
             
             <div className="flex items-center justify-between pt-4 border-t border-gray-200">
               <div className="text-sm text-gray-500">
                 Only filled fields will be updated. Empty fields will be set to null.
               </div>
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPriceForm(false)}
                  disabled={updatingPrices}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updatingPrices}
                  className="flex items-center space-x-2 px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {updatingPrices ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Settings size={16} />
                      <span>Update Prices</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      
    </div>
  );
}
