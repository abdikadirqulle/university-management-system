import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchX, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-3xl px-4 sm:px-6 text-center">
        <div className="mb-8">
          <div className="relative mx-auto w-48 h-48 mb-4">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SearchX className="h-24 w-24 text-primary/80" />
            </div>
          </div>
          <h1 className="text-8xl font-bold text-primary mb-4 animate-enter">
            404
          </h1>
          <p className="text-2xl text-foreground/80 mb-6 max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off.
          </p>
          <p className="text-muted-foreground mb-8">
            We couldn't find the page at{" "}
            <span className="font-mono bg-accent/50 px-2 py-1 rounded">
              {location.pathname}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            size="lg"
            asChild
            className="group transition-all duration-300 transform hover:scale-105"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              <span>Go Home</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="group transition-all duration-300"
          >
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Go Back</span>
            </Link>
          </Button>
        </div>

        <div className="mt-16 text-muted-foreground text-sm">
          <p>Lost? Try navigating to one of our main sections:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Link
              to="/admin/dashboard"
              className="px-3 py-1 rounded-full bg-accent/50 hover:bg-accent transition-colors"
            >
              Admin
            </Link>
            <Link
              to="/admission/dashboard"
              className="px-3 py-1 rounded-full bg-accent/50 hover:bg-accent transition-colors"
            >
              Admission
            </Link>
            <Link
              to="/student/dashboard"
              className="px-3 py-1 rounded-full bg-accent/50 hover:bg-accent transition-colors"
            >
              Student
            </Link>
            <Link
              to="/financial/dashboard"
              className="px-3 py-1 rounded-full bg-accent/50 hover:bg-accent transition-colors"
            >
              Financial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
