import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDown, ArrowUp, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getMarketData } from '@/services/socketService';

const Market = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }
    setUser({ name: username });
    
    // Fetch market data
    const fetchMarketData = async () => {
      try {
        const result = await getMarketData();
        if (result.success && result.stocks) {
          setStocks(result.stocks);
        } else {
          console.error('Failed to fetch market data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        // For demo purposes, set some sample data if the API fails
        setStocks([
          {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            price: 176.38,
            change: 1.25,
            volume: '32.5M',
            marketCap: '2.75T',
            pe: 29.2,
            dividend: 0.58,
            data: Array.from(Array(20), (_, i) => ({
              date: new Date(Date.now() - (19-i) * 86400000).toISOString().split('T')[0],
              price: 170 + Math.random() * 15
            }))
          },
          {
            ticker: 'MSFT',
            name: 'Microsoft Corporation',
            price: 417.21,
            change: 0.78,
            volume: '25.3M',
            marketCap: '3.1T',
            pe: 36.5,
            dividend: 0.68,
            data: Array.from(Array(20), (_, i) => ({
              date: new Date(Date.now() - (19-i) * 86400000).toISOString().split('T')[0],
              price: 410 + Math.random() * 20
            }))
          },
          {
            ticker: 'GOOGL',
            name: 'Alphabet Inc.',
            price: 148.52,
            change: -0.43,
            volume: '18.7M',
            marketCap: '1.85T',
            pe: 25.6,
            dividend: 0,
            data: Array.from(Array(20), (_, i) => ({
              date: new Date(Date.now() - (19-i) * 86400000).toISOString().split('T')[0],
              price: 145 + Math.random() * 10
            }))
          },
          {
            ticker: 'AMZN',
            name: 'Amazon.com Inc.',
            price: 182.87,
            change: 2.14,
            volume: '27.9M',
            marketCap: '1.9T',
            pe: 49.8,
            dividend: 0,
            data: Array.from(Array(20), (_, i) => ({
              date: new Date(Date.now() - (19-i) * 86400000).toISOString().split('T')[0],
              price: 175 + Math.random() * 15
            }))
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [navigate]);

  const filteredStocks = stocks.filter(stock => 
    stock && (
      (stock.ticker && stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  // Navigate to dashboard with selected stock
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-6 max-w-7xl mx-auto py-12">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Market</h1>
            <p className="text-muted-foreground">Explore and track stocks</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search stocks..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Market Overview</CardTitle>
                <CardDescription>Live prices for popular stocks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left font-medium">Symbol</th>
                        <th className="p-3 text-left font-medium">Name</th>
                        <th className="p-3 text-right font-medium">Price</th>
                        <th className="p-3 text-right font-medium">Change</th>
                        <th className="p-3 text-center font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStocks.length > 0 ? (
                        filteredStocks.map((stock) => (
                          <tr 
                            key={stock.ticker} 
                            className={`border-t hover:bg-muted/30 cursor-pointer ${selectedStock?.ticker === stock.ticker ? 'bg-muted/30' : ''}`}
                            onClick={() => setSelectedStock(stock)}
                          >
                            <td className="p-3 font-semibold">{stock.ticker}</td>
                            <td className="p-3">{stock.name}</td>
                            <td className="p-3 text-right">${typeof stock.price === 'number' ? stock.price.toFixed(2) : '0.00'}</td>
                            <td className="p-3 text-right">
                              <div className={`flex items-center justify-end ${(stock.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(stock.change || 0) >= 0 ? 
                                  <ArrowUp className="h-3 w-3 mr-1" /> : 
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                }
                                {typeof stock.change === 'number' ? Math.abs(stock.change).toFixed(2) : '0.00'}%
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStock(stock);
                                }}
                                className="text-xs"
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-muted-foreground">
                            No stocks found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Stock Info Panel */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Stock Information</CardTitle>
                <CardDescription>Detailed market data</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedStock ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold">{selectedStock.name} ({selectedStock.ticker})</h3>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-2xl font-bold">${typeof selectedStock.price === 'number' ? selectedStock.price.toFixed(2) : '0.00'}</span>
                        <span className={`text-sm ${(selectedStock.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(selectedStock.change || 0) >= 0 ? '+' : ''}{typeof selectedStock.change === 'number' ? selectedStock.change.toFixed(2) : '0.00'}%
                        </span>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Market Cap</p>
                          <p className="font-medium">{selectedStock.marketCap || `${(Math.floor(Math.random() * 900) + 100).toFixed(2)}B`}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Volume</p>
                          <p className="font-medium">{selectedStock.volume || `${(Math.floor(Math.random() * 90) + 10).toFixed(1)}M`}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P/E Ratio</p>
                          <p className="font-medium">{selectedStock.pe || (Math.floor(Math.random() * 40) + 10).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dividend Yield</p>
                          <p className="font-medium">{selectedStock.dividend ? `${selectedStock.dividend}%` : `${(Math.random() * 3).toFixed(2)}%`}</p>
                        </div>
                      </div>
                      
                      <div className="h-48 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={selectedStock.data || Array.from(Array(20), (_, i) => ({
                              date: new Date(Date.now() - (19-i) * 86400000).toISOString().split('T')[0],
                              price: (typeof selectedStock.price === 'number' ? selectedStock.price : 100) * (0.9 + Math.random() * 0.2)
                            }))}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => value.split('-').slice(1).join('/')}
                            />
                            <YAxis 
                              domain={['dataMin - 5', 'dataMax + 5']} 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => `${typeof value === 'number' ? value.toFixed(0) : '0'}`}
                            />
                            <Tooltip 
                              formatter={(value) => [`${typeof value === 'number' ? value.toFixed(2) : '0.00'}`, 'Price']}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#3b82f6" 
                              fillOpacity={1} 
                              fill="url(#colorPrice)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Key Statistics</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">52-Week High</p>
                          <p className="font-medium">${typeof selectedStock.price === 'number' ? (selectedStock.price * 1.2).toFixed(2) : '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">52-Week Low</p>
                          <p className="font-medium">${typeof selectedStock.price === 'number' ? (selectedStock.price * 0.8).toFixed(2) : '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg. Volume</p>
                          <p className="font-medium">{selectedStock.volume}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Beta</p>
                          <p className="font-medium">{(Math.random() * 1.5 + 0.5).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full mt-6"
                        onClick={handleGoToDashboard}
                      >
                        Trade on Dashboard
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-muted-foreground mb-4">Select a stock to view details</div>
                    <SlidersHorizontal className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Market;