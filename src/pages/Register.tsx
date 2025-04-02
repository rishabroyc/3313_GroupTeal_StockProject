
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthForm from '@/components/auth/AuthForm';

const Register = () => {
  return (
    <Layout withoutFooter className="flex items-center justify-center bg-secondary/30">
      <div className="w-full max-w-md p-8 mx-auto my-16">
        <div className="text-center mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join StockSphere and start trading</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-soft">
          <AuthForm type="register" />
          
          <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in delayed-200">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground animate-fade-in delayed-300">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="hover:text-foreground underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="hover:text-foreground underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
