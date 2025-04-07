import React from 'react';
import Layout from '@/components/layout/Layout';

const TermsPage = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-6 mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
        <div className="text-muted-foreground text-sm leading-6 space-y-6">
          <p>
            Welcome to <strong>StockSphere</strong>. By accessing and using this platform, you agree to the following terms and conditions. Please read them carefully.
          </p>

          <p>
            This application is intended for educational and demonstration purposes only. StockSphere does not offer real-time financial services, investment advice, or the ability to trade with real currency. All trades made on this platform are simulated.
          </p>

          <p>
            All user activity, including trades, portfolio management, and session data, is stored locally and will not be shared or used for any purpose beyond academic demonstration. The application does not connect to any external user databases or secure identity systems.
          </p>

          <p>
            While we strive to offer a realistic trading experience using publicly available stock data, we do not guarantee accuracy, timeliness, or completeness of the data presented on the platform. Use at your own risk.
          </p>

          <p>
            By continuing to use StockSphere, you acknowledge that this project was developed as part of a university software engineering course and agree to use it responsibly in an academic or testing environment only.
          </p>

          <p>
            For any questions about these terms or your use of the platform, contact us at <a href="mailto:support@stocksphere.com" className="underline">support@stocksphere.com</a>.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
