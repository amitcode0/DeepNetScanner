
import React from 'react';
import { useNetworkData } from '@/hooks/useNetworkData';
import Header from '@/components/Dashboard/Header';
import TrafficMonitor from '@/components/Dashboard/TrafficMonitor';
import AttackDetection from '@/components/Dashboard/AttackDetection';
import AlertPanel from '@/components/Dashboard/AlertPanel';
import AttackLogs from '@/components/Dashboard/AttackLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';

const Index = () => {
  const {
    alerts,
    isMonitoring,
    thresholds,
    realtimeTraffic,
    stats,
    selectedAttackDemo,
    toggleMonitoring,
    acknowledgeAlert,
    updateThresholds,
    selectAttackDemo
  } = useNetworkData(true); // true enables demo mode
  
  return (
    <div className="min-h-screen bg-cyber-darker flex flex-col">
      <Header 
        isMonitoring={isMonitoring}
        toggleMonitoring={toggleMonitoring}
        activeSessions={stats.activeSessions.length}
        alertsCount={alerts.filter(a => !a.acknowledged).length}
      />
      
      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-4 bg-cyber-dark border-cyber-blue/20 border p-1">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-cyber-blue/10 data-[state=active]:text-cyber-light-blue"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-cyber-blue/10 data-[state=active]:text-cyber-light-blue"
            >
              About
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <TrafficMonitor 
              realtimeTraffic={realtimeTraffic}
              stats={stats}
              selectAttackDemo={selectAttackDemo}
              selectedAttackDemo={selectedAttackDemo}
            />
            
            <AttackDetection 
              stats={stats} 
              thresholds={thresholds}
              updateThresholds={updateThresholds}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <AttackLogs stats={stats} />
              </div>
              <div>
                <AlertPanel 
                  alerts={alerts}
                  acknowledgeAlert={acknowledgeAlert}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-4">
            <Card className="bg-cyber-darker border-cyber-blue/20">
              <CardHeader>
                <CardTitle className="text-cyber-light-blue">About DDoS Detection Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  This DDoS detection tool is designed to help identify and monitor common DDoS attack patterns, 
                  including SYN floods, HTTP floods, and UDP floods. The tool analyzes network traffic patterns 
                  to detect potential attacks based on configurable thresholds.
                </p>
                
                <div className="bg-cyber-dark p-4 rounded-lg border border-cyber-blue/20">
                  <h3 className="text-cyber-light-blue font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Demo Mode
                  </h3>
                  <p className="text-sm text-gray-300">
                    This version runs in demo mode with simulated traffic. In a real deployment, this tool would 
                    integrate with Wireshark or other packet capture libraries to analyze actual network traffic.
                  </p>
                </div>
                
                <h3 className="text-cyber-light-blue font-medium mt-4">Detected Attack Types:</h3>
                
                <div className="space-y-3">
                  <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                    <h4 className="font-medium mb-1">SYN Flood</h4>
                    <p className="text-sm text-gray-300">
                      A SYN flood is a form of denial-of-service attack in which an attacker sends a succession of 
                      SYN requests to a target's system, but never completes the handshake. This consumes server 
                      resources and can make the system unresponsive.
                    </p>
                  </div>
                  
                  <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                    <h4 className="font-medium mb-1">HTTP Flood</h4>
                    <p className="text-sm text-gray-300">
                      An HTTP flood attack is a type of application layer attack that uses seemingly legitimate 
                      HTTP GET or POST requests to attack a web server or application. These attacks are often 
                      hard to distinguish from normal traffic.
                    </p>
                  </div>
                  
                  <div className="bg-cyber-dark p-3 rounded-lg border border-gray-800">
                    <h4 className="font-medium mb-1">UDP Flood</h4>
                    <p className="text-sm text-gray-300">
                      A UDP flood is a type of denial-of-service attack in which a large number of UDP packets 
                      are sent to random ports on a targeted server. The server checks for applications on those 
                      ports, and when no application is found, replies with an ICMP "Destination Unreachable" packet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-cyber-dark py-2 px-4 text-center text-xs text-gray-500 border-t border-cyber-darker">
        DDoS Detection Tool - © 2025 - For educational purposes only
      </footer>
    </div>
  );
};

export default Index;
