
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkStats, ThresholdSettings } from '@/types/network';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface AttackDetectionProps {
  stats: NetworkStats;
  thresholds: ThresholdSettings;
  updateThresholds: (thresholds: Partial<ThresholdSettings>) => void;
}

const AttackDetection: React.FC<AttackDetectionProps> = ({ 
  stats, 
  thresholds,
  updateThresholds
}) => {
  const [localThresholds, setLocalThresholds] = React.useState<ThresholdSettings>(thresholds);
  
  React.useEffect(() => {
    setLocalThresholds(thresholds);
  }, [thresholds]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalThresholds(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };
  
  const handleSave = () => {
    updateThresholds(localThresholds);
  };
  
  // Determine if we're currently detecting an attack
  const activeSynFlood = stats.alerts.some(a => a.attackType === 'SYN Flood' && !a.acknowledged);
  const activeHttpFlood = stats.alerts.some(a => a.attackType === 'HTTP Flood' && !a.acknowledged);
  const activeUdpFlood = stats.alerts.some(a => a.attackType === 'UDP Flood' && !a.acknowledged);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <Card className="bg-cyber-darker border-cyber-blue/20">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cyber-light-blue">Attack Detection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">SYN Flood</h3>
                <div className="flex justify-between items-center">
                  <div className={`text-lg font-semibold ${activeSynFlood ? 'attack-high' : 'status-normal'}`}>
                    {activeSynFlood ? 'DETECTED' : 'Normal'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Threshold: {thresholds.synFloodPacketsPerSecond} pkts/s
                  </div>
                </div>
              </div>
              
              <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">HTTP Flood</h3>
                <div className="flex justify-between items-center">
                  <div className={`text-lg font-semibold ${activeHttpFlood ? 'attack-high' : 'status-normal'}`}>
                    {activeHttpFlood ? 'DETECTED' : 'Normal'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Threshold: {thresholds.httpFloodRequestsPerSecond} req/s
                  </div>
                </div>
              </div>
              
              <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">UDP Flood</h3>
                <div className="flex justify-between items-center">
                  <div className={`text-lg font-semibold ${activeUdpFlood ? 'attack-high' : 'status-normal'}`}>
                    {activeUdpFlood ? 'DETECTED' : 'Normal'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Threshold: {thresholds.udpFloodPacketsPerSecond} pkts/s
                  </div>
                </div>
              </div>
              
              <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Overall Status</h3>
                <div className="flex justify-between items-center">
                  <div 
                    className={`text-lg font-semibold ${
                      activeSynFlood || activeHttpFlood || activeUdpFlood 
                        ? 'attack-high' 
                        : 'status-normal'
                    }`}
                  >
                    {activeSynFlood || activeHttpFlood || activeUdpFlood 
                      ? 'ATTACK IN PROGRESS' 
                      : 'Normal'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-cyber-darker border-cyber-blue/20">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cyber-light-blue">Detection Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="synFloodPacketsPerSecond">SYN Flood (packets/sec)</Label>
                <Input 
                  id="synFloodPacketsPerSecond"
                  name="synFloodPacketsPerSecond"
                  type="number"
                  value={localThresholds.synFloodPacketsPerSecond}
                  onChange={handleChange}
                  className="bg-cyber-dark border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="httpFloodRequestsPerSecond">HTTP Flood (requests/sec)</Label>
                <Input 
                  id="httpFloodRequestsPerSecond"
                  name="httpFloodRequestsPerSecond"
                  type="number"
                  value={localThresholds.httpFloodRequestsPerSecond}
                  onChange={handleChange}
                  className="bg-cyber-dark border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="udpFloodPacketsPerSecond">UDP Flood (packets/sec)</Label>
                <Input 
                  id="udpFloodPacketsPerSecond"
                  name="udpFloodPacketsPerSecond"
                  type="number"
                  value={localThresholds.udpFloodPacketsPerSecond}
                  onChange={handleChange}
                  className="bg-cyber-dark border-gray-700"
                />
              </div>
              
              <Button 
                onClick={handleSave}
                className="w-full bg-cyber-blue hover:bg-blue-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Thresholds
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttackDetection;
