
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, User, Shield, Bell, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userJson = sessionStorage.getItem('user');
    
    if (!userJson) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(userJson);
    setUser(userData);
    setProfileForm({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
    });
    setLoading(false);
  }, [navigate]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would be an API call
    const updatedUser = {
      ...user,
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
    };
    
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    toast.success('Profile updated successfully');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // In a real app, this would be an API call
    toast.success('Password updated successfully');
    
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="mt-4 md:mt-0 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="md:col-span-1 animate-slide-up">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-12 w-12" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="pt-4 w-full">
                  <p className="text-sm font-medium mb-1">Account Balance</p>
                  <p className="text-2xl font-bold">
                    ${typeof user?.balance === 'number' ? user.balance.toLocaleString() : '0.00'}
                  </p>

                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3 animate-slide-up">
            <Tabs defaultValue="personal">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Account Settings</CardTitle>
                  <TabsList>
                    <TabsTrigger value="personal" className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Personal</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-1">
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span>Payment</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="personal" className="mt-0">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          value={profileForm.name} 
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={profileForm.email} 
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={profileForm.phone} 
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button type="submit">Update Profile</Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit">Update Password</Button>
                  </form>

                  <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                    <p className="text-muted-foreground mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="trade-confirm" className="mt-1" defaultChecked />
                        <div>
                          <Label htmlFor="trade-confirm" className="cursor-pointer">Trade Confirmations</Label>
                          <p className="text-sm text-muted-foreground">Receive email notifications when your trades are executed.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="price-alerts" className="mt-1" defaultChecked />
                        <div>
                          <Label htmlFor="price-alerts" className="cursor-pointer">Price Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when stocks hit your target prices.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="market-news" className="mt-1" defaultChecked />
                        <div>
                          <Label htmlFor="market-news" className="cursor-pointer">Market News</Label>
                          <p className="text-sm text-muted-foreground">Stay updated with important market news and events.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="account-updates" className="mt-1" defaultChecked />
                        <div>
                          <Label htmlFor="account-updates" className="cursor-pointer">Account Updates</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications about account activity and updates.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">Push Notifications</h3>
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="push-trade" className="mt-1" defaultChecked />
                        <div>
                          <Label htmlFor="push-trade" className="cursor-pointer">Trade Alerts</Label>
                          <p className="text-sm text-muted-foreground">Receive push notifications for trade activities.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="push-price" className="mt-1" defaultChecked />
                        <div>
                          <Label htmlFor="push-price" className="cursor-pointer">Price Movements</Label>
                          <p className="text-sm text-muted-foreground">Get notified of significant price movements in your watchlist.</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button>Save Preferences</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="payment" className="mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Payment Methods</h3>
                      <div className="bg-muted/30 p-4 rounded-lg border flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-background p-2 rounded-md">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/24</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Remove</Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline">Add Payment Method</Button>
                    
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">Deposit Funds</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input id="amount" type="number" placeholder="0.00" min="0" step="0.01" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <select id="paymentMethod" className="w-full p-2 rounded-md border">
                            <option>•••• •••• •••• 4242</option>
                            <option>Add New Payment Method</option>
                          </select>
                        </div>
                      </div>
                      <Button>Deposit Funds</Button>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">Withdrawal</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="withdrawAmount">Amount</Label>
                          <Input id="withdrawAmount" type="number" placeholder="0.00" min="0" step="0.01" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawMethod">Withdrawal Method</Label>
                          <select id="withdrawMethod" className="w-full p-2 rounded-md border">
                            <option>Bank Account (ACH)</option>
                            <option>Wire Transfer</option>
                          </select>
                        </div>
                      </div>
                      <Button>Withdraw Funds</Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
