import { Link } from 'react-router-dom';
import { MapPin, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
          <MapPin className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Location Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Looks like you've wandered off the map. The page you're looking for doesn't exist.
        </p>
        
        <Link to="/">
          <Button className="bg-gradient-hero hover:opacity-90 transition-all duration-300">
            <Home className="w-4 h-4 mr-2" />
            Return to Map
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
