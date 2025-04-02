
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowDown, ArrowUp, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Mock data
const generateStockData = (days = 30, volatility = 0.02, startPrice = 150) => {
  const data = [];
  let price = startPrice + Math.random() * 50;

  for (let i = 0; i < days; i++) {
    const change = price * volatility * (Math.random() - 0.5);
    price += change;
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(Math.max(0, Number(price.toFixed(2))))
    });
  }

  return data;
};

const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.42, change: 1.2, volume: '45.2M', marketCap: '2.8T', pe: 28.4, dividend: 0.58, data: generateStockData(30, 0.02, 175) },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 334.78, change: -0.5, volume: '22.1M', marketCap: '2.5T', pe: 34.2, dividend: 0.94, data: generateStockData(30, 0.015, 330) },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.60, change: 0.8, volume: '18.7M', marketCap: '1.8T', pe: 25.1, dividend: 0, data: generateStockData(30, 0.02, 135) },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.15, change: 2.1, volume: '32.9M', marketCap: '1.9T', pe: 60.8, dividend: 0, data: generateStockData(30, 0.025, 170) },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 245.36, change: 3.4, volume: '98.5M', marketCap: '780B', pe: 73.5, dividend: 0, data: generateStockData(30, 0.04, 230) },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 474.36, change: 1.9, volume: '15.3M', marketCap: '1.2T', pe: 31.8, dividend: 0, data: generateStockData(30, 0.02, 460) },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 824.19, change: 4.3, volume: '40.7M', marketCap: '2.0T', pe: 72.1, dividend: 0.04, data: generateStockData(30, 0.03, 800) },
  { symbol: 'BRK.A', name: 'Berkshire Hathaway', price: 568942.55, change: 0.2, volume: '1.5K', marketCap: '829B', pe: 9.7, dividend: 0, data: generateStockData(30, 0.01, 560000) },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 187.23, change: -0.7, volume: '8.2M', marketCap: '540B', pe: 14.2, dividend: 4.1, data: generateStockData(30, 0.015, 190) },
  { symbol: 'V', name: 'Visa Inc.', price: 275.80, change: 0.5, volume: '5.9M', marketCap: '570B', pe: 30.5, dividend: 0.8, data: generateStockData(30, 0.01, 273) },
];

const Market = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userJson = sessionStorage.getItem('user');
    
    if (!userJson) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userJson));
    setLoading(false);
  }, [navigate]);

  const handleBuyStock = () => {
    if (!selectedStock) return;
    
    // Simple validation
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    const total = selectedStock.price * quantity;
    
    if (total > user.balance) {
      toast.error('Insufficient funds');
      return;
    }
    
    // In a real app, we'd send this to the server
    toast.success(`Purchased ${quantity} shares of ${selectedStock.symbol} for $${total.toFixed(2)}`);
    
    // Update user balance in session storage
    const updatedUser = {
      ...user,
      balance: user.balance - total
    };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const handleSellStock = () => {
    if (!selectedStock) return;
    
    // Simple validation
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    // In a real app, we'd check if the user owns enough shares
    // Here we just simulate the transaction
    const total = selectedStock.price * quantity;
    
    toast.success(`Sold ${quantity} shares of ${selectedStock.symbol} for $${total.toFixed(2)}`);
    
    // Update user balance in session storage
    const updatedUser = {
      ...user,
      balance: user.balance + total
    };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold">Market</h1>
            <p className="text-muted-foreground">Explore and trade stocks</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search stocks..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 animate-slide-up">
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Price</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Change</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Volume</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map((stock) => (
                        <tr 
                          key={stock.symbol} 
                          className={`border-b hover:bg-muted/20 transition-colors cursor-pointer ${selectedStock?.symbol === stock.symbol ? 'bg-muted/30' : ''}`}
                          onClick={() => setSelectedStock(stock)}
                        >
                          <td className="px-6 py-4 text-sm font-medium">{stock.symbol}</td>
                          <td className="px-6 py-4 text-sm">{stock.name}</td>
                          <td className="px-6 py-4 text-sm text-right">${stock.price.toLocaleString()}</td>
                          <td className={`px-6 py-4 text-sm text-right ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {stock.change >= 0 ? 
                              <span className="flex items-center justify-end">
                                <ArrowUp className="h-3 w-3 mr-1" /> {stock.change}%
                              </span> : 
                              <span className="flex items-center justify-end">
                                <ArrowDown className="h-3 w-3 mr-1" /> {Math.abs(stock.change)}%
                              </span>
                            }
                          </td>
                          <td className="px-6 py-4 text-sm text-right">{stock.volume}</td>
                          <td className="px-6 py-4 text-sm text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStock(stock);
                                document.getElementById('buy-sell-section')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              Trade
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          No stocks found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Market Indices</CardTitle>
              <CardDescription>Today's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <p className="font-medium">S&P 500</p>
                    <p className="text-xs text-muted-foreground">US Large Cap</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">4,583.64</p>
                    <p className="text-xs text-success flex items-center justify-end">
                      <ArrowUp className="h-3 w-3 mr-1" /> 0.86%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <p className="font-medium">Nasdaq</p>
                    <p className="text-xs text-muted-foreground">US Tech</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">14,353.64</p>
                    <p className="text-xs text-success flex items-center justify-end">
                      <ArrowUp className="h-3 w-3 mr-1" /> 1.12%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <p className="font-medium">Dow Jones</p>
                    <p className="text-xs text-muted-foreground">US Blue Chip</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">38,059.13</p>
                    <p className="text-xs text-destructive flex items-center justify-end">
                      <ArrowDown className="h-3 w-3 mr-1" /> 0.23%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <p className="font-medium">Russell 2000</p>
                    <p className="text-xs text-muted-foreground">US Small Cap</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">2,012.15</p>
                    <p className="text-xs text-success flex items-center justify-end">
                      <ArrowUp className="h-3 w-3 mr-1" /> 0.47%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">VIX</p>
                    <p className="text-xs text-muted-foreground">Volatility Index</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">17.25</p>
                    <p className="text-xs text-destructive flex items-center justify-end">
                      <ArrowDown className="h-3 w-3 mr-1" /> 2.15%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {selectedStock && (
          <div id="buy-sell-section" className="mt-8 animate-slide-up">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedStock.name} ({selectedStock.symbol})</CardTitle>
                    <CardDescription>
                      <span className={`${selectedStock.change >= 0 ? 'text-success' : 'text-destructive'} font-medium`}>
                        ${selectedStock.price.toLocaleString()} {' '}
                        {selectedStock.change >= 0 ? 
                          <span className="inline-flex items-center">
                            <ArrowUp className="h-3 w-3 inline mr-1" /> {selectedStock.change}%
                          </span> : 
                          <span className="inline-flex items-center">
                            <ArrowDown className="h-3 w-3 inline mr-1" /> {Math.abs(selectedStock.change)}%
                          </span>
                        }
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Market Cap: {selectedStock.marketCap} • P/E: {selectedStock.pe} • Dividend: {selectedStock.dividend}%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedStock.data}>
                        <defs>
                          <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          domain={['dataMin - 10', 'dataMax + 10']}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Price']}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '0.375rem'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          fill="url(#stockGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <Tabs defaultValue="buy">
                      <TabsList className="w-full mb-4">
                        <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
                        <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="buy">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2 text-sm font-medium">
                            <span>Available Balance</span>
                            <span>${user.balance.toLocaleString()}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input 
                              type="number" 
                              min="1" 
                              value={quantity} 
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} 
                            />
                          </div>
                          
                          <div className="flex items-center justify-between my-4 pb-4 border-b">
                            <span className="text-sm">Estimated Cost</span>
                            <span className="font-medium">${(selectedStock.price * quantity).toLocaleString()}</span>
                          </div>
                          
                          <Button 
                            className="w-full" 
                            onClick={handleBuyStock}
                            disabled={user.balance < selectedStock.price * quantity || quantity <= 0}
                          >
                            Buy {selectedStock.symbol}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="sell">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input 
                              type="number" 
                              min="1" 
                              value={quantity} 
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between my-4 pb-4 border-b">
                            <span className="text-sm">Estimated Proceeds</span>
                            <span className="font-medium">${(selectedStock.price * quantity).toLocaleString()}</span>
                          </div>
                          
                          <Button 
                            className="w-full" 
                            onClick={handleSellStock}
                            disabled={quantity <= 0}
                          >
                            Sell {selectedStock.symbol}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="mt-6 text-xs text-muted-foreground">
                      <p className="mb-2">Market orders are executed at the current market price.</p>
                      <p>Trade commissions: $0.00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Market;
