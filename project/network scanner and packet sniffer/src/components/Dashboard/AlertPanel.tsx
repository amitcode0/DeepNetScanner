
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttackAlert } from '@/types/network';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, BarChart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlertPanelProps {
  alerts: AttackAlert[];
  acknowledgeAlert: (alertId: string) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, acknowledgeAlert }) => {
  // Sort alerts by timestamp (most recent first) and unacknowledged first
  const sortedAlerts = [...alerts].sort((a, b) => {
    // Unacknowledged alerts first
    if (a.acknowledged !== b.acknowledged) {
      return a.acknowledged ? 1 : -1;
    }
    // Then by timestamp (most recent first)
    return b.timestamp - a.timestamp;
  });
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'text-cyber-red';
      case 'Medium':
        return 'text-cyber-orange';
      case 'Low':
        return 'text-cyber-yellow';
      default:
        return 'text-gray-400';
    }
  };
  
  const getAttackTypeIcon = (attackType: string) => {
    switch (attackType) {
      case 'SYN Flood':
        return <AlertTriangle className="text-cyber-red h-5 w-5" />;
      case 'HTTP Flood':
        return <BarChart className="text-cyber-orange h-5 w-5" />;
      case 'UDP Flood':
        return <AlertTriangle className="text-cyber-yellow h-5 w-5" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="bg-cyber-darker border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="text-base font-medium text-cyber-light-blue">Attack Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {sortedAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No alerts detected
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.acknowledged 
                      ? 'bg-cyber-dark/60 border-gray-800' 
                      : 'bg-cyber-dark border-cyber-blue/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getAttackTypeIcon(alert.attackType)}
                      <span className="font-medium">{alert.attackType}</span>
                      <span className={`text-sm ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
                  
                  <div className="text-xs text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                    <div>
                      <span className="text-gray-500">Target:</span> {alert.targetIP}:{alert.targetPort}
                    </div>
                    <div>
                      <span className="text-gray-500">Sources:</span> {alert.sourceIPs.length}
                    </div>
                    <div>
                      <span className="text-gray-500">Rate:</span> {alert.packetsPerSecond.toFixed(1)}/s
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span> {alert.duration}s
                    </div>
                  </div>
                  
                  {!alert.acknowledged && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-700 hover:bg-cyber-blue/10 hover:border-cyber-blue"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlertPanel;
