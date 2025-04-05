import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowDown, ArrowUp, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMarketData, getPortfolio } from '@/services/socketService';

// Helper function to generate chart data
const generateStockData = (days = 30, volatility = 0.02) => {
  const data = [];
  let price = 150 + Math.random() * 50;

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

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // State for market and portfolio data
  const [marketData, setMarketData] = useState<Array<{ ticker: string, name: string, price: number }>>([]);
  const [portfolioData, setPortfolioData] = useState<Array<{ ticker: string, quantity: number }>>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  
  // Generate chart data
  const chartData = generateStockData(30, 0.01);

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    
    if (!username) {
      navigate('/login');
      return;
    }
    
    // Create a mock user object since we only have the username
    const mockUser = {
      name: username,
      balance: 100000 // Default balance
    };
    
    setUser(mockUser);
    
    // Fetch market data
    const fetchMarketData = async () => {
      try {
        setIsLoadingMarketData(true);
        const result = await getMarketData();
        if (result.success && result.stocks) {
          setMarketData(result.stocks);
        } else {
          console.error('Failed to fetch market data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoadingMarketData(false);
      }
    };
    
    // Fetch portfolio data
    const fetchPortfolioData = async () => {
      try {
        setIsLoadingPortfolio(true);
        const result = await getPortfolio(username);
        if (result.success && result.holdings) {
          setPortfolioData(result.holdings);
        } else {
          console.error('Failed to fetch portfolio:', result.message);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setIsLoadingPortfolio(false);
      }
    };
    
    // Call both fetch functions
    fetchMarketData();
    fetchPortfolioData();
    
    // Complete loading
    setLoading(false);
  }, [navigate]);
  
  // Calculate total portfolio value
  const calculatePortfolioValue = () => {
    if (portfolioData.length === 0 || marketData.length === 0) return 0;
    
    return portfolioData.reduce((total, holding) => {
      const stock = marketData.find(s => s.ticker === holding.ticker);
      if (stock) {
        return total + (stock.price * holding.quantity);
      }
      return total;
    }, 0);
  };
  
  const totalPortfolioValue = calculatePortfolioValue();

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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-white px-4 py-2 rounded-lg shadow-soft">
            <Wallet className="h-5 w-5 text-primary mr-2" />
            <span className="font-medium">Balance:</span>
            <span className="ml-2 font-bold">${user.balance.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="animate-slide-up md:col-span-3 h-[400px]">
            <CardHeader className="pb-2">
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value) => [`$${value}`, 'Value']}
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
                    fill="url(#portfolioGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Total Value</p>
                <p className="text-2xl font-bold">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-muted-foreground text-sm mb-2">Your Holdings</p>
                <div className="space-y-3">
                  {isLoadingPortfolio ? (
                    <div className="flex justify-center py-2">
                      <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  ) : portfolioData.length > 0 ? (
                    portfolioData.map((holding) => {
                      // Find stock price from market data
                      const stockInfo = marketData.find(stock => stock.ticker === holding.ticker);
                      const price = stockInfo?.price || 0;
                      
                      return (
                        <div key={holding.ticker} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{holding.ticker}</p>
                            <p className="text-xs text-muted-foreground">{holding.quantity} shares</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              ${(price * holding.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      You don't own any stocks yet
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Market Overview</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <p className="font-medium">S&P 500</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">4,583.64</p>
                    <p className="text-xs text-success">+0.86%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <p className="font-medium">Nasdaq</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">14,353.64</p>
                    <p className="text-xs text-success">+1.12%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <p className="font-medium">Dow Jones</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">38,059.13</p>
                    <p className="text-xs text-destructive">-0.23%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Russell 2000</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">2,012.15</p>
                    <p className="text-xs text-success">+0.47%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-up md:col-span-2 overflow-hidden h-80">
            <Tabs defaultValue="stocks">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Live Market Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="stocks" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingMarketData ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-center">
                              <div className="flex justify-center">
                                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                              </div>
                            </td>
                          </tr>
                        ) : marketData.length > 0 ? (
                          marketData.map((stock) => (
                            <tr key={stock.ticker} className="border-b hover:bg-muted/20 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium">{stock.ticker}</td>
                              <td className="px-6 py-4 text-sm">{stock.name}</td>
                              <td className="px-6 py-4 text-sm text-right">${stock.price.toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-center text-muted-foreground">
                              No market data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
        
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest stock trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Shares</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm">May 15, 2023</td>
                    <td className="px-6 py-4 text-sm font-medium">AAPL</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">Buy</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">5</td>
                    <td className="px-6 py-4 text-sm text-right">$178.42</td>
                    <td className="px-6 py-4 text-sm text-right">$892.10</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm">May 12, 2023</td>
                    <td className="px-6 py-4 text-sm font-medium">MSFT</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">Buy</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">3</td>
                    <td className="px-6 py-4 text-sm text-right">$334.78</td>
                    <td className="px-6 py-4 text-sm text-right">$1,004.34</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm">May 10, 2023</td>
                    <td className="px-6 py-4 text-sm font-medium">TSLA</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-destructive/20 text-destructive">Sell</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">2</td>
                    <td className="px-6 py-4 text-sm text-right">$245.36</td>
                    <td className="px-6 py-4 text-sm text-right">$490.72</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm">May 5, 2023</td>
                    <td className="px-6 py-4 text-sm font-medium">AMZN</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">Buy</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">4</td>
                    <td className="px-6 py-4 text-sm text-right">$178.15</td>
                    <td className="px-6 py-4 text-sm text-right">$712.60</td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm">May 2, 2023</td>
                    <td className="px-6 py-4 text-sm font-medium">GOOGL</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">Buy</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">3</td>
                    <td className="px-6 py-4 text-sm text-right">$139.60</td>
                    <td className="px-6 py-4 text-sm text-right">$418.80</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;