import React from 'react';
import Layout from '@/components/layout/Layout';

const AboutPage = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-12 px-6 mx-auto">
        <h1 className="text-3xl font-bold mb-4">About</h1>
        <div className="text-muted-foreground text-sm leading-6 space-y-6">
          <p>
            <strong>StockSphere</strong> is a modern, web-based platform built to simulate real-world stock trading using live market data. Designed with both learners and developers in mind, StockSphere offers an intuitive interface that lets users explore investment strategies, monitor trends, and execute trades in a safe, educational environment.
          </p>

          <p>
            Our goal is to make the world of finance and investing more accessible — whether you're a beginner learning how to place your first order, a student analyzing market trends, or a developer exploring how financial apps are built from scratch.
          </p>

          <p>
            StockSphere integrates a custom-built C++ backend that manages user authentication, trade execution, and CSV-based transaction logging over TCP sockets. The frontend is built using React and TypeScript with real-time market updates, responsive design, and modern UI/UX practices.
          </p>

          <p>
            We believe education should be hands-on — that’s why StockSphere gives you a realistic trading experience without any real-world risk. You can buy and sell stocks, view your portfolio, analyze stock charts, and test your strategies — all within a smooth and performant app.
          </p>

          <p>
            This project was developed as part of the SE3313A Software Engineering course at Western University. It demonstrates full-stack software development, concurrency, persistent storage, API integration, and clean user-centric design.
          </p>

          <p>
            Thank you for using StockSphere. We hope it sparks curiosity, fuels learning, and makes financial education just a little more fun.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
