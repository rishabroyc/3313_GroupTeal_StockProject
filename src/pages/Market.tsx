import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDown, ArrowUp, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const fetchStockChartData = async (symbol: string) => {
  const apiKey = import.meta.env.VITE_TWELVE_API_KEY;
  const res = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${apiKey}`);
  const json = await res.json();

  if (!json || !json.values) return [];

  return json.values.map((point: any) => ({
    date: point.datetime,
    price: parseFloat(point.close)
  })).reverse();
};

const Market = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }
    setUser({ name: username });
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
        const formattedSymbols = symbols.join(",");
        const apiKey = import.meta.env.VITE_TWELVE_API_KEY;

        const res = await fetch(`https://api.twelvedata.com/quote?symbol=${formattedSymbols}&apikey=${apiKey}`);
        const data = await res.json();

        const results = await Promise.all(
          symbols.map(async (symbol) => {
            const stock = data[symbol] || data;
            const chartData = await fetchStockChartData(symbol);
            return {
              symbol: stock.symbol,
              name: stock.name,
              price: parseFloat(stock.price),
              change: parseFloat(stock.percent_change),
              volume: stock.volume,
              marketCap: stock.market_cap || 'N/A',
              pe: stock.pe || 0,
              dividend: stock.dividend || 0,
              data: chartData,
            };
          })
        );

        setStocks(results);
      } catch (err) {
        console.error("Error fetching stocks:", err);
        toast.error("Failed to fetch live market data");
      }
    };

    fetchStocks();
  }, []);

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBuyStock = () => {
    if (!selectedStock || quantity <= 0) return;
    const total = selectedStock.price * quantity;
    if (total > user.balance) {
      toast.error('Insufficient funds');
      return;
    }
    toast.success(`Purchased ${quantity} shares of ${selectedStock.symbol} for $${total.toFixed(2)}`);
    const updatedUser = { ...user, balance: user.balance - total };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const handleSellStock = () => {
    if (!selectedStock || quantity <= 0) return;
    const total = selectedStock.price * quantity;
    toast.success(`Sold ${quantity} shares of ${selectedStock.symbol} for $${total.toFixed(2)}`);
    const updatedUser = { ...user, balance: user.balance + total };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
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
            <p className="text-muted-foreground">Explore and trade stocks</p>
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
          </div>
        </div>
        {/* Insert filtered stock table and chart/trade logic here using filteredStocks and selectedStock */}
      </div>
    </Layout>
  );
};

export default Market;
