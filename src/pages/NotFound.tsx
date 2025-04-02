
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout withoutFooter>
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
        <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <p className="max-w-md text-center text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
