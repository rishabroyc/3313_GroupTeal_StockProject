import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMarketData, getPortfolio, buyStock, sellStock } from '@/services/socketService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for market and portfolio data
  const [marketData, setMarketData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  
  // State for buy/sell dialogs
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [dialogAction, setDialogAction] = useState('buy'); // 'buy' or 'sell'

  useEffect(() => {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    
    if (!username) {
      navigate('/login');
      return;
    }
    
    // Create a user object with just the username
    const userObj = {
      name: username
    };
    
    setUser(userObj);
    
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
  
  // Function to refresh data after a purchase
  const refreshData = () => {
    const username = localStorage.getItem('username');
    if (username) {
      setIsLoadingMarketData(true);
      setIsLoadingPortfolio(true);
      
      getMarketData()
        .then(result => {
          if (result.success && result.stocks) {
            setMarketData(result.stocks);
          }
        })
        .finally(() => setIsLoadingMarketData(false));
      
      getPortfolio(username)
        .then(result => {
          if (result.success && result.holdings) {
            setPortfolioData(result.holdings);
          }
        })
        .finally(() => setIsLoadingPortfolio(false));
    }
  };
  
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

  // Handle buy button click
  const handleBuyClick = (stock) => {
    console.log("Buy button clicked for:", stock);
    setSelectedStock(stock);
    setDialogAction('buy');
    setQuantity(1);
    // Force update with a slight delay to ensure state is properly updated
    setTimeout(() => {
      setBuyDialogOpen(true);
    }, 10);
  };

  // Handle sell button click
  const handleSellClick = (stock) => {
    console.log("Sell button clicked for:", stock);
    setSelectedStock(stock);
    setDialogAction('sell');
    
    // Find how many shares the user owns of this stock
    const holding = portfolioData.find(h => h.ticker === stock.ticker);
    const maxShares = holding ? holding.quantity : 0;
    
    // Set initial quantity to 1 or max available if less than 1
    setQuantity(maxShares > 0 ? 1 : 0);
    
    // Force update with a slight delay to ensure state is properly updated
    setTimeout(() => {
      setBuyDialogOpen(true);
    }, 10);
  };

  // Handle transaction confirmation (both buy and sell)
  const handleTransactionConfirm = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username || !selectedStock) return;

      let result;
      
      if (dialogAction === 'buy') {
        result = await buyStock(username, selectedStock.ticker, quantity);
      } else {
        result = await sellStock(username, selectedStock.ticker, quantity);
      }
      
      if (result.success) {
        toast({
          title: dialogAction === 'buy' ? "Purchase successful" : "Sale successful",
          description: dialogAction === 'buy' 
            ? `You bought ${quantity} shares of ${selectedStock.ticker}` 
            : `You sold ${quantity} shares of ${selectedStock.ticker}`,
        });
        
        // Refresh data after successful transaction
        refreshData();
      } else {
        toast({
          title: dialogAction === 'buy' ? "Purchase failed" : "Sale failed",
          description: result.message || `An error occurred during ${dialogAction === 'buy' ? 'purchase' : 'sale'}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: dialogAction === 'buy' ? "Purchase failed" : "Sale failed",
        description: "Could not complete the transaction",
        variant: "destructive"
      });
    } finally {
      setBuyDialogOpen(false);
      setSelectedStock(null);
      setQuantity(1);
    }
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="animate-slide-up md:col-span-3 h-[400px]">
            <CardHeader className="pb-2">
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Historical data</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] flex items-center justify-center">
              <p className="text-muted-foreground">No performance data available</p>
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
        
        <Card className="animate-slide-up mb-8">
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
                        <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingMarketData ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center">
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
                            <td className="px-6 py-4 text-sm text-right">
                              <div className="flex space-x-2 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleBuyClick(stock)}
                                  className="text-xs"
                                >
                                  Buy
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSellClick(stock)}
                                  className="text-xs"
                                >
                                  Sell
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
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
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No transaction history available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Transaction Modal - Using a fixed position div for simplicity */}
      {buyDialogOpen && selectedStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setBuyDialogOpen(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{dialogAction === 'buy' ? 'Buy' : 'Sell'} Stock</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dialogAction === 'buy' 
                    ? `Purchase shares of ${selectedStock.name} (${selectedStock.ticker}) at ${selectedStock.price.toFixed(2)} per share.`
                    : `Sell shares of ${selectedStock.name} (${selectedStock.ticker}) at ${selectedStock.price.toFixed(2)} per share.`
                  }
                </p>
              </div>
              
              <div className="grid gap-4 py-4">
                {dialogAction === 'sell' && (
                  <div className="text-sm mb-2">
                    {(() => {
                      const holding = portfolioData.find(h => h.ticker === selectedStock.ticker);
                      const sharesOwned = holding ? holding.quantity : 0;
                      return (
                        <p className={sharesOwned === 0 ? "text-red-500" : ""}>
                          You currently own {sharesOwned} shares of {selectedStock.ticker}
                        </p>
                      );
                    })()}
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="quantity" className="text-right text-sm">
                    Quantity
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 0;
                      
                      // For sell, limit to shares owned
                      if (dialogAction === 'sell') {
                        const holding = portfolioData.find(h => h.ticker === selectedStock.ticker);
                        const maxShares = holding ? holding.quantity : 0;
                        setQuantity(Math.min(newValue, maxShares));
                      } else {
                        setQuantity(newValue > 0 ? newValue : 1);
                      }
                    }}
                    min={dialogAction === 'buy' ? "1" : "0"}
                    max={dialogAction === 'sell' ? (() => {
                      const holding = portfolioData.find(h => h.ticker === selectedStock.ticker);
                      return holding ? holding.quantity : 0;
                    })() : undefined}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right text-sm">Total</span>
                  <div className="col-span-3 font-medium">
                    ${(quantity * selectedStock.price).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setBuyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleTransactionConfirm}
                  disabled={dialogAction === 'sell' && (() => {
                    const holding = portfolioData.find(h => h.ticker === selectedStock.ticker);
                    return !holding || holding.quantity === 0 || quantity === 0;
                  })()}
                >
                  {dialogAction === 'buy' ? 'Confirm Purchase' : 'Confirm Sale'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;