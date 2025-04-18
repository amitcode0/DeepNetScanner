
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Wifi, Activity, Play, Pause } from 'lucide-react';

interface HeaderProps {
  isMonitoring: boolean;
  toggleMonitoring: () => void;
  activeSessions: number;
  alertsCount: number;
}

const Header: React.FC<HeaderProps> = ({ 
  isMonitoring, 
  toggleMonitoring, 
  activeSessions, 
  alertsCount 
}) => {
  return (
    <header className="border-b border-cyber-darker px-4 py-3 flex items-center justify-between bg-cyber-dark">
      <div className="flex items-center space-x-2">
        <ShieldAlert size={28} className="text-cyber-blue" />
        <h1 className="text-xl font-bold">DDoS Detection Tool</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Wifi size={18} className="text-cyber-light-blue" />
          <span className="text-sm">
            <span className="text-muted-foreground">Sessions:</span> {activeSessions}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Activity size={18} className={alertsCount > 0 ? "text-cyber-red" : "text-cyber-green"} />
          <span className="text-sm">
            <span className="text-muted-foreground">Alerts:</span>{' '}
            <span className={alertsCount > 0 ? "text-cyber-red font-medium" : ""}>
              {alertsCount}
            </span>
          </span>
        </div>
        
        <Button
          onClick={toggleMonitoring}
          variant={isMonitoring ? "destructive" : "default"}
          className={isMonitoring ? "bg-cyber-red hover:bg-red-700" : "bg-cyber-green hover:bg-green-700"}
        >
          {isMonitoring ? (
            <span className="flex items-center gap-2">
              <Pause size={16} />
              Stop Monitoring
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play size={16} />
              Start Monitoring
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
