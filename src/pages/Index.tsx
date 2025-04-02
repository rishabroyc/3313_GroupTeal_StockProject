
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart2, Shield, Zap } from 'lucide-react';

const Index = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      el.classList.add('opacity-0', 'translate-y-10');
      el.classList.add('transition-all', 'duration-700', 'ease-out');
      observerRef.current?.observe(el);
    });
    
    return () => {
      if (observerRef.current) {
        animatedElements.forEach(el => {
          observerRef.current?.unobserve(el);
        });
      }
    };
  }, []);

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Real-Time Data",
      description: "Access up-to-the-minute stock prices and market data to make informed trading decisions."
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-primary" />,
      title: "Portfolio Tracking",
      description: "Monitor your investments with detailed analytics and performance metrics in real-time."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Secure Trading",
      description: "Execute trades with confidence on our secure platform with transaction integrity."
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '1M+', label: 'Daily Transactions' },
    { value: '100+', label: 'Global Markets' },
    { value: '$0', label: 'Commission Fees' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 pt-20 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_70%,rgba(8,145,227,0.1),transparent)]" />
        <div className="container px-6 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-slide-down mb-6">
            The Future of Stock Trading
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground animate-slide-down delayed-100 mb-10">
            Experience the most intuitive trading platform with real-time data, advanced analytics, and seamless execution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-down delayed-200">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/market">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                Explore Market
              </Button>
            </Link>
          </div>
          
          {/* Dashboard Preview */}
          <div className="mt-16 md:mt-24 relative animate-slide-up delayed-300 max-w-5xl mx-auto">
            <div className="w-full h-[40vh] md:h-[50vh] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-2xl overflow-hidden relative">
              <div className="p-4 h-[10%] border-b border-gray-700">
                <div className="w-48 h-6 bg-gray-700 rounded-md animate-pulse-subtle"></div>
              </div>
              <div className="flex h-[90%]">
                <div className="w-1/4 border-r border-gray-700 p-4">
                  <div className="w-full h-8 bg-gray-700 rounded-md mb-4 animate-pulse-subtle"></div>
                  <div className="w-full h-6 bg-gray-700/60 rounded-md mb-3 animate-pulse-subtle"></div>
                  <div className="w-full h-6 bg-gray-700/60 rounded-md mb-3 animate-pulse-subtle"></div>
                  <div className="w-full h-6 bg-gray-700/60 rounded-md animate-pulse-subtle"></div>
                </div>
                <div className="w-3/4 p-4">
                  <div className="h-1/2 bg-gray-800 rounded-md mb-4 p-3">
                    <div className="w-full h-full flex items-end">
                      <div className="w-1/12 h-[30%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[45%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[60%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[40%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[80%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[70%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[90%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[50%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[75%] bg-primary/70 rounded-sm mx-1"></div>
                      <div className="w-1/12 h-[85%] bg-primary/70 rounded-sm mx-1"></div>
                    </div>
                  </div>
                  <div className="h-1/2 flex space-x-4">
                    <div className="w-1/2 bg-gray-800 rounded-md p-3">
                      <div className="w-24 h-5 bg-gray-700 rounded-md mb-3 animate-pulse-subtle"></div>
                      <div className="flex items-center space-x-1">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-700 rounded-md animate-pulse-subtle"></div>
                      </div>
                    </div>
                    <div className="w-1/2 bg-gray-800 rounded-md p-3">
                      <div className="w-24 h-5 bg-gray-700 rounded-md mb-3 animate-pulse-subtle"></div>
                      <div className="flex items-center space-x-1">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-700 rounded-md animate-pulse-subtle"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Reflective surface */}
            <div className="w-full h-16 mx-auto bg-gradient-to-b from-black/20 to-transparent rounded-b-lg transform -translate-y-2 scale-x-95"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-secondary/50">
        <div className="container px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Trading Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed with sophisticated tools to help you trade with confidence and precision.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-soft hover-scale animate-on-scroll"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_30%,rgba(8,145,227,0.05),transparent)]" />
        <div className="container px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="animate-on-scroll">
                <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary">
        <div className="container px-6 max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-on-scroll">
              Ready to Start Trading?
            </h2>
            <p className="text-white/90 mb-8 animate-on-scroll">
              Join thousands of traders on our platform and experience the future of stock trading today.
            </p>
            <Link to="/register" className="animate-on-scroll inline-block">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 px-8"
              >
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
