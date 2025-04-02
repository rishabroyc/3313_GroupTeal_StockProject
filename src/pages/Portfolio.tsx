
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Portfolio = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      { symbol: 'AAPL', name: 'Apple Inc.', shares: 15, price: 178.42, value: 2676.30, change: 1.2, allocation: 25 },
      { symbol: 'MSFT', name: 'Microsoft', shares: 10, price: 334.78, value: 3347.80, change: -0.5, allocation: 30 },
      { symbol: 'GOOGL', name: 'Alphabet', shares: 5, price: 139.60, value: 698.00, change: 0.8, allocation: 15 },
      { symbol: 'AMZN', name: 'Amazon', shares: 8, price: 178.15, value: 1425.20, change: 2.1, allocation: 20 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 2, price: 824.19, value: 1648.38, change: 4.3, allocation: 10 },
    ]
  };
  
  const filteredStocks = portfolio.stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const pieData = portfolio.stocks.map(stock => ({
    name: stock.symbol,
    value: stock.allocation
  }));

  return (
    <Layout>
      <div className="container px-6 max-w-7xl mx-auto py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">Manage your investments</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-white px-4 py-2 rounded-lg shadow-soft">
            <span className="font-medium">Total Value:</span>
            <span className="ml-2 font-bold">${portfolio.totalValue.toLocaleString()}</span>
            <div className={`ml-3 flex items-center ${portfolio.change >= 0 ? 'text-success' : 'text-destructive'}`}>
              {portfolio.change >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              <span>{portfolio.change}%</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Investments</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search stocks..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Shares</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Price</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Value</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Change</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map((stock, index) => (
                        <tr key={stock.symbol} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{stock.symbol}</td>
                          <td className="px-6 py-4 text-sm">{stock.name}</td>
                          <td className="px-6 py-4 text-sm text-right">{stock.shares}</td>
                          <td className="px-6 py-4 text-sm text-right">${stock.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-right">${stock.value.toFixed(2)}</td>
                          <td className={`px-6 py-4 text-sm text-right ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                          </td>
                          <td className="px-6 py-4 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8 text-xs">Buy</Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs">Sell</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                          No stocks found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-up h-[400px]">
            <CardHeader>
              <CardTitle>Allocation</CardTitle>
              <CardDescription>Portfolio distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Allocation']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.375rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground">Total Investment</span>
                  <span className="font-medium">$100,000.00</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-medium">${portfolio.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground">Total Return</span>
                  <span className="font-medium text-success">+$24,763.29 (24.76%)</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground">Daily Change</span>
                  <span className={`font-medium ${portfolio.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {portfolio.change >= 0 ? '+' : ''}{portfolio.changeAmount.toLocaleString()} ({portfolio.change}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Unrealized Gains</span>
                  <span className="font-medium text-success">+$24,763.29</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-up">
            <Tabs defaultValue="performance">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Portfolio Analysis</CardTitle>
                  <TabsList>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="risk">Risk</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="performance" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">1 Month Return</span>
                      <span className="text-sm font-medium text-success">+3.45%</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-success" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">3 Month Return</span>
                      <span className="text-sm font-medium text-success">+8.21%</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-success" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">YTD Return</span>
                      <span className="text-sm font-medium text-success">+15.32%</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-success" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">1 Year Return</span>
                      <span className="text-sm font-medium text-success">+24.76%</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-success" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Your portfolio is outperforming the S&P 500 by 2.3% over the last year.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="risk" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volatility (Beta)</span>
                      <span className="text-sm font-medium">1.12</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-warning" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                      <span className="text-sm font-medium">1.8</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-success" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Diversification</span>
                      <span className="text-sm font-medium">Medium</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                      <div className="h-full bg-warning" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Your portfolio has slightly higher risk than the market average but with better returns.
                    </p>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;
