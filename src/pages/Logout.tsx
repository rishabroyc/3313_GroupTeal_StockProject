// In LogoutButton.tsx
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout}
      className="bg-white hover:bg-gray-100 gap-2"
    >
      <LogOut size={16} />
      Logout
    </Button>
  );
};

export default LogoutButton;