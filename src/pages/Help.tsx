import React from 'react';
import Layout from '@/components/layout/Layout';

const HelpPage = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-6 mx-auto">
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <div className="text-muted-foreground text-sm leading-6 space-y-6">
          <p>
            Welcome to the StockSphere Help Center. If you're having trouble using the app or have general questions, you're in the right place.
          </p>

          <h2 className="text-lg font-semibold">🔑 Logging In</h2>
          <p>
            To use the platform, simply register with a username on the Register page. Once registered, you can log in to access your dashboard and portfolio.
          </p>

          <h2 className="text-lg font-semibold">📈 Viewing Market Data</h2>
          <p>
            Navigate to the Market page to view real-time stock data. You can search for tickers, view charts, and explore key metrics.
          </p>

          <h2 className="text-lg font-semibold">💸 Making Trades</h2>
          <p>
            From the Market page, you can buy or sell shares of any available stock. Trades are simulated and tracked within your portfolio.
          </p>

          <h2 className="text-lg font-semibold">📊 Portfolio</h2>
          <p>
            The Portfolio page shows a snapshot of your current holdings and trade history. This is updated every time you make a trade.
          </p>

          <h2 className="text-lg font-semibold">🛠 Troubleshooting</h2>
          <p>
            If the site isn’t responding, try refreshing the page, restarting your local server, or checking the browser console for errors. Make sure you’ve compiled the C++ backend and that it's running.
          </p>

          <h2 className="text-lg font-semibold">📬 Still Need Help?</h2>
          <p>
            Reach out to us any time at <a href="mailto:support@stocksphere.com" className="underline">support@stocksphere.com</a>. We're happy to help.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default HelpPage;
