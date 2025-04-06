import React from 'react';
import Layout from '@/components/layout/Layout';

const PrivacyPage = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-6 mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <div className="text-muted-foreground text-sm leading-6 space-y-6">
          <p>
            At <strong>StockSphere</strong>, we value your privacy and are committed to protecting any personal information you provide while using the platform.
          </p>

          <p>
            This application is built solely for educational purposes. We do not collect, store, or share any sensitive personal information such as passwords, emails, or financial details. All account data is stored locally using simple identifiers like usernames, with no third-party integration or tracking.
          </p>

          <p>
            Any stock trades, transactions, or portfolio data are saved locally in CSV files and are only accessible within the scope of this project. These files exist solely to simulate backend persistence and will never be shared outside your instance.
          </p>

          <p>
            If you're using this app in a shared or public environment, please ensure you clear your session data after use. We recommend using this app for testing, learning, and experimenting with trading mechanics — not for storing any sensitive information.
          </p>

          <p>
            We do not use cookies, analytics services, or external trackers. Your experience on StockSphere is fully self-contained and offline by design.
          </p>

          <p>
            For questions or concerns regarding privacy or data use, feel free to reach out to us at <a href="mailto:support@stocksphere.com" className="underline">support@stocksphere.com</a>.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
