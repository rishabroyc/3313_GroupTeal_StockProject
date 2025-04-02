
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthForm from '@/components/auth/AuthForm';

const Login = () => {
  return (
    <Layout withoutFooter className="flex items-center justify-center bg-secondary/30">
      <div className="w-full max-w-md p-8 mx-auto my-16">
        <div className="text-center mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your StockSphere account</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-soft">
          <AuthForm type="login" />
          
          <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in delayed-200">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
