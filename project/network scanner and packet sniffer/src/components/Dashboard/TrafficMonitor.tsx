
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NetworkStats } from '@/types/network';

interface TrafficMonitorProps {
  realtimeTraffic: {
    timestamp: number;
    tcp: number;
    udp: number;
    http: number;
    other: number;
  }[];
  stats: NetworkStats;
  selectAttackDemo: (attackType: string | null) => void;
  selectedAttackDemo: string | null;
}

const TrafficMonitor: React.FC<TrafficMonitorProps> = ({ 
  realtimeTraffic,
  stats,
  selectAttackDemo,
  selectedAttackDemo
}) => {
  // Format time for x-axis
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString().slice(-8);
  };
  
  const handleDemoChange = (value: string) => {
    selectAttackDemo(value === "none" ? null : value);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <Card className="bg-cyber-darker border-cyber-blue/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium text-cyber-light-blue">Realtime Traffic (packets/s)</CardTitle>
            <Select 
              onValueChange={handleDemoChange} 
              defaultValue={selectedAttackDemo || "none"}
            >
              <SelectTrigger className="w-[180px] bg-cyber-dark border-cyber-blue/30">
                <SelectValue placeholder="Select demo" />
              </SelectTrigger>
              <SelectContent className="bg-cyber-darker border-cyber-blue/30">
                <SelectItem value="none">Normal Traffic</SelectItem>
                <SelectItem value="syn-flood">SYN Flood Demo</SelectItem>
                <SelectItem value="http-flood">HTTP Flood Demo</SelectItem>
                <SelectItem value="udp-flood">UDP Flood Demo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={realtimeTraffic}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime} 
                  stroke="#94a3b8"
                  tick={{fontSize: 12}}
                />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number) => [`${value} pkts/s`, '']}
                  labelFormatter={formatTime}
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#3b82f6', color: '#fff'}}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tcp" 
                  stroke="#3b82f6" 
                  name="TCP"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="udp" 
                  stroke="#a855f7" 
                  name="UDP" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="http" 
                  stroke="#22c55e" 
                  name="HTTP/S"
                  strokeWidth={2}
                  dot={false} 
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="other" 
                  stroke="#f97316" 
                  name="Other"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-cyber-darker border-cyber-blue/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-cyber-light-blue">Protocol Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.protocolDistribution}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="protocol" 
                  stroke="#94a3b8"
                  tick={{fontSize: 12}}
                />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)} pkts/s`, '']}
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#3b82f6', color: '#fff'}}
                />
                <Legend />
                <Bar 
                  dataKey="packets" 
                  name="Packets/s" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficMonitor;
