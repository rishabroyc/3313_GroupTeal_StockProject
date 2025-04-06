import React from 'react';
import Layout from '@/components/layout/Layout';

const ContactPage = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-6 mx-auto">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <div className="text-muted-foreground text-sm leading-6 space-y-6">
          <p>
            Have a question, idea, or need help with StockSphere? We’d love to hear from you.
          </p>

          <h2 className="text-lg font-semibold">📬 Email</h2>
          <p>
            Reach out any time at <a href="mailto:support@stocksphere.com" className="underline">support@stocksphere.com</a> and we’ll get back to you as soon as we can.
          </p>

          <h2 className="text-lg font-semibold">💻 GitHub Issues</h2>
          <p>
            Found a bug or want to request a feature? Open an issue on our GitHub repository. We actively monitor and respond to feedback during development.
          </p>

          <h2 className="text-lg font-semibold">🤝 Collaboration</h2>
          <p>
            If you're a student, developer, or designer interested in contributing to StockSphere, feel free to get in touch. We welcome collaboration and open-source support.
          </p>

          <h2 className="text-lg font-semibold">📍 Project Context</h2>
          <p>
            This application was built as part of a university-level software engineering course (SE3313A). While it simulates real stock trading, it is not connected to any real brokerage accounts.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
