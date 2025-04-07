import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const sendBackendCommand = async (command: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8081', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include',
      body: `${command}\n`,
    });

    const rawResponse = await response.text();

    // Find the last double line break — the HTTP body starts after this
    const separator = "\r\n\r\n";
    const splitIndex = rawResponse.lastIndexOf(separator);
    const cleanResponse = splitIndex !== -1 ? rawResponse.substring(splitIndex + separator.length) : rawResponse;

    return cleanResponse.trim();
  } catch (error) {
    console.error('Error communicating with backend:', error);
    throw error;
  }
};

interface AuthFormProps {
  type: 'login' | 'register';
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }
    
    setLoading(true);

    try {
      // Send the appropriate command to the backend
      const command = type === 'login' 
        ? `LOGIN|${username}|${password}` 
        : `REGISTER|${username}|${password}`;
      
      console.log(`Sending ${type} command: ${command}`);
      const response = await sendBackendCommand(command);
      console.log(`Received response: ${response}`);
      
      // Parse the response
      if (response.startsWith('OK|')) {
        // Assuming the response is formatted as "OK|Logged in|<username>"
        const parts = response.split('|');
        const loggedInUsername = parts[2]; // Get the username from the response
        
        if (type === 'login') {
          // Store the username for display purposes (even though session management is done via cookies)
          localStorage.setItem('username', loggedInUsername);
          
          toast.success('Successfully signed in');
          
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/dashboard');
          }
        } else {
          // This is registration success
          toast.success('Account created successfully! Please log in.');
          
          // Redirect to login page with newly created username pre-filled
          navigate('/login', { 
            state: { 
              registeredUsername: username,
              message: 'Your account has been created successfully. Please sign in with your credentials.'
            } 
          });
        }
      } else if (response.startsWith('ERROR|')) {
        // Extract the error message
        const errorMessage = response.substring(6);
        toast.error(errorMessage);
      } else {
        toast.error('Unexpected response from server');
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      toast.error(type === 'login' 
        ? 'Failed to sign in. Is the server running?' 
        : 'Failed to create account. Is the server running?'
      );
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          placeholder={type === 'login' ? "Enter your username" : "Choose a username"}
          value={username}
          onChange={handleUsernameChange}
          required
          className="h-12"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            required
            className="h-12 pr-10"
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className={cn("w-full h-12 mt-6", loading && "opacity-80")} 
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
            <span>{type === 'login' ? 'Signing in...' : 'Creating account...'}</span>
          </div>
        ) : (
          <span>{type === 'login' ? 'Sign In' : 'Create Account'}</span>
        )}
      </Button>
    </form>
  );
};

export default AuthForm;