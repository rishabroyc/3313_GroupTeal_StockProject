
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowDown, ArrowUp, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
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

const stockData = generateStockData();
const portfolioData = generateStockData(30, 0.01);

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Mock portfolio data
  const portfolio = {
    totalValue: 124763.29,
    change: 2.34,
    changeAmount: 2837.41,
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc.', shares: 15, price: 178.42, change: 1.2 },
      { symbol: 'MSFT', name: 'Microsoft', shares: 10, price: 334.78, change: -0.5 },
      { symbol: 'GOOGL', name: 'Alphabet', shares: 5, price: 139.60, change: 0.8 },
      { symbol: 'AMZN', name: 'Amazon', shares: 8, price: 178.15, change: 2.1 },
    ]
  };

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
                <AreaChart data={portfolioData}>
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
                <p className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded-full ${portfolio.change >= 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                  {portfolio.change >= 0 ? 
                    <ArrowUp className="h-4 w-4 text-success" /> : 
                    <ArrowDown className="h-4 w-4 text-destructive" />
                  }
                </div>
                <span className={`text-sm font-medium ${portfolio.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {portfolio.change >= 0 ? '+' : ''}{portfolio.change}% (${portfolio.changeAmount.toLocaleString()})
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-muted-foreground text-sm mb-2">Top Holdings</p>
                <div className="space-y-3">
                  {portfolio.stocks.slice(0, 3).map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground">{stock.shares} shares</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${stock.price}</p>
                        <p className={`text-xs ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </p>
                      </div>
                    </div>
                  ))}
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
            <Tabs defaultValue="trending">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Stocks</CardTitle>
                  <TabsList>
                    <TabsTrigger value="trending">Trending</TabsTrigger>
                    <TabsTrigger value="gainers">Gainers</TabsTrigger>
                    <TabsTrigger value="losers">Losers</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="trending" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Price</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">AAPL</td>
                          <td className="px-6 py-4 text-sm">Apple Inc.</td>
                          <td className="px-6 py-4 text-sm text-right">$178.42</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+1.2%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">TSLA</td>
                          <td className="px-6 py-4 text-sm">Tesla, Inc.</td>
                          <td className="px-6 py-4 text-sm text-right">$245.36</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+3.4%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">MSFT</td>
                          <td className="px-6 py-4 text-sm">Microsoft Corp.</td>
                          <td className="px-6 py-4 text-sm text-right">$334.78</td>
                          <td className="px-6 py-4 text-sm text-right text-destructive">-0.5%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">AMZN</td>
                          <td className="px-6 py-4 text-sm">Amazon.com Inc.</td>
                          <td className="px-6 py-4 text-sm text-right">$178.15</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+2.1%</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">NVDA</td>
                          <td className="px-6 py-4 text-sm">NVIDIA Corp.</td>
                          <td className="px-6 py-4 text-sm text-right">$824.19</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+4.3%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="gainers" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Price</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">NVDA</td>
                          <td className="px-6 py-4 text-sm">NVIDIA Corp.</td>
                          <td className="px-6 py-4 text-sm text-right">$824.19</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+4.3%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">AMD</td>
                          <td className="px-6 py-4 text-sm">Advanced Micro Devices</td>
                          <td className="px-6 py-4 text-sm text-right">$156.84</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+3.8%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">TSLA</td>
                          <td className="px-6 py-4 text-sm">Tesla, Inc.</td>
                          <td className="px-6 py-4 text-sm text-right">$245.36</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+3.4%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">AMZN</td>
                          <td className="px-6 py-4 text-sm">Amazon.com Inc.</td>
                          <td className="px-6 py-4 text-sm text-right">$178.15</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+2.1%</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">META</td>
                          <td className="px-6 py-4 text-sm">Meta Platforms Inc.</td>
                          <td className="px-6 py-4 text-sm text-right">$474.36</td>
                          <td className="px-6 py-4 text-sm text-right text-success">+1.9%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="losers" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Price</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">INTC</td>
                          <td className="px-6 py-4 text-sm">Intel Corp.</td>
                          <td className="px-6 py-4 text-sm text-right">$31.75</td>
                          <td className="px-6 py-4 text-sm text-right text-destructive">-5.2%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">DIS</td>
                          <td className="px-6 py-4 text-sm">Walt Disney Co.</td>
                          <td className="px-6 py-4 text-sm text-right">$103.56</td>
                          <td className="px-6 py-4 text-sm text-right text-destructive">-2.8%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">PFE</td>
                          <td className="px-6 py-4 text-sm">Pfizer Inc.</td>
                          <td className="px-6 py-4 text-sm text-right">$28.47</td>
                          <td className="px-6 py-4 text-sm text-right text-destructive">-1.7%</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">WMT</td>
                          <td className="px-6 py-4 text-sm">Walmart Inc.</td>
                          <td className="px-6 py-4 text-sm text-right">$57.89</td>
                          <td className="px-6 py-4 text-sm text-right text-destructive">-1.2%</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">MSFT</td>
                          <td className="px-6 py-4 text-sm">Microsoft Corp.</td>
                          <td className="px-6 py-4 text-sm text-right">$334.78</td>
                          <td className="px-6 py-4 text-sm text-right text-destructive">-0.5%</td>
                        </tr>
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
