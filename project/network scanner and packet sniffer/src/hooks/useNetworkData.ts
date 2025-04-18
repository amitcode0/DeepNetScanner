import { useState, useEffect, useCallback } from 'react';
import { 
  TrafficDataPoint, 
  NetworkSession, 
  AttackAlert,
  NetworkStats,
  ThresholdSettings
} from '@/types/network';
import { detectAttacks, generateSampleData } from '@/utils/attackDetection';

const DEFAULT_THRESHOLDS: ThresholdSettings = {
  synFloodPacketsPerSecond: 100,
  httpFloodRequestsPerSecond: 50,
  udpFloodPacketsPerSecond: 200
};

export function useNetworkData(demo = true) {
  const [traffic, setTraffic] = useState<TrafficDataPoint[]>([]);
  const [sessions, setSessions] = useState<NetworkSession[]>([]);
  const [alerts, setAlerts] = useState<AttackAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [thresholds, setThresholds] = useState<ThresholdSettings>(DEFAULT_THRESHOLDS);
  const [selectedAttackDemo, setSelectedAttackDemo] = useState<string | null>(null);
  
  // For real-time traffic charts
  const [realtimeTraffic, setRealtimeTraffic] = useState<{
    timestamp: number;
    tcp: number;
    udp: number;
    http: number;
    other: number;
  }[]>([]);
  
  // Toggle monitoring state
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);
  
  // Acknowledge an alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true } 
          : alert
      )
    );
  }, []);
  
  // Update threshold settings
  const updateThresholds = useCallback((newThresholds: Partial<ThresholdSettings>) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }));
  }, []);
  
  // Select a demo attack type
  const selectAttackDemo = useCallback((attackType: string | null) => {
    setSelectedAttackDemo(attackType);
  }, []);
  
  // Demo mode data generation
  useEffect(() => {
    if (!demo || !isMonitoring) return;
    
    const intervalId = setInterval(() => {
      // Generate sample data based on selected attack demo
      const includeSynFlood = selectedAttackDemo === 'syn-flood';
      const includeHttpFlood = selectedAttackDemo === 'http-flood';
      const includeUdpFlood = selectedAttackDemo === 'udp-flood';
      
      const { traffic: newTraffic, sessions: newSessions } = generateSampleData(
        includeSynFlood,
        includeHttpFlood,
        includeUdpFlood
      );
      
      // Keep only recent data (last 60 seconds)
      const now = Date.now();
      const cutoff = now - 60000;
      
      setTraffic(prev => {
        const filtered = [...prev, ...newTraffic].filter(t => t.timestamp > cutoff);
        return filtered.slice(-1000); // Limit to 1000 entries
      });
      
      setSessions(prev => {
        const filtered = [...prev, ...newSessions].filter(s => s.lastSeen > cutoff);
        return filtered.slice(-1000); // Limit to 1000 entries
      });
      
      // Update realtime traffic data for charts
      setRealtimeTraffic(prev => {
        const point = {
          timestamp: now,
          tcp: Math.floor(newTraffic.filter(t => t.protocol === 'TCP').reduce((sum, t) => sum + t.packetsPerSecond, 0)),
          udp: Math.floor(newTraffic.filter(t => t.protocol === 'UDP').reduce((sum, t) => sum + t.packetsPerSecond, 0)),
          http: Math.floor(newTraffic.filter(t => ['HTTP', 'HTTPS'].includes(t.protocol)).reduce((sum, t) => sum + t.packetsPerSecond, 0)),
          other: Math.floor(newTraffic.filter(t => !['TCP', 'UDP', 'HTTP', 'HTTPS'].includes(t.protocol)).reduce((sum, t) => sum + t.packetsPerSecond, 0))
        };
        
        const newData = [...prev, point];
        // Keep last 30 points
        return newData.slice(-30);
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [demo, isMonitoring, selectedAttackDemo]);
  
  // Run attack detection
  useEffect(() => {
    if (!isMonitoring) return;
    
    const intervalId = setInterval(() => {
      const newAlerts = detectAttacks(traffic, sessions, thresholds);
      
      if (newAlerts.length > 0) {
        setAlerts(prev => {
          // Filter out duplicates (alerts for the same attack within a short time)
          const existingIds = new Set(prev.map(a => a.id.split('-').slice(0, 2).join('-')));
          const filteredNewAlerts = newAlerts.filter(a => !existingIds.has(a.id.split('-').slice(0, 2).join('-')));
          
          // Combine with existing alerts, keeping most recent 100
          return [...prev, ...filteredNewAlerts]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 100);
        });
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [traffic, sessions, isMonitoring, thresholds]);
  
  // Compute network statistics
  const computeNetworkStats = useCallback((): NetworkStats => {
    const now = Date.now();
    const last5Min = now - 300000;
    
    // Filter recent traffic
    const recentTraffic = traffic.filter(t => t.timestamp > last5Min);
    
    // Calculate top sources
    const sourceCounts: Record<string, { packets: number, bytes: number }> = {};
    recentTraffic.forEach(t => {
      if (!t.sourceIP) return;
      
      if (!sourceCounts[t.sourceIP]) {
        sourceCounts[t.sourceIP] = { packets: 0, bytes: 0 };
      }
      
      sourceCounts[t.sourceIP].packets += t.packetsPerSecond;
      sourceCounts[t.sourceIP].bytes += t.bytesPerSecond;
    });
    
    const topSources = Object.entries(sourceCounts)
      .map(([ip, { packets, bytes }]) => ({ ip, packets, bytes }))
      .sort((a, b) => b.packets - a.packets)
      .slice(0, 10);
    
    // Calculate top destinations
    const destCounts: Record<string, { packets: number, bytes: number }> = {};
    recentTraffic.forEach(t => {
      if (!t.destinationIP) return;
      
      if (!destCounts[t.destinationIP]) {
        destCounts[t.destinationIP] = { packets: 0, bytes: 0 };
      }
      
      destCounts[t.destinationIP].packets += t.packetsPerSecond;
      destCounts[t.destinationIP].bytes += t.bytesPerSecond;
    });
    
    const topDestinations = Object.entries(destCounts)
      .map(([ip, { packets, bytes }]) => ({ ip, packets, bytes }))
      .sort((a, b) => b.packets - a.packets)
      .slice(0, 10);
    
    // Calculate protocol distribution
    const protocolCounts: Record<string, { packets: number, bytes: number }> = {};
    recentTraffic.forEach(t => {
      if (!protocolCounts[t.protocol]) {
        protocolCounts[t.protocol] = { packets: 0, bytes: 0 };
      }
      
      protocolCounts[t.protocol].packets += t.packetsPerSecond;
      protocolCounts[t.protocol].bytes += t.bytesPerSecond;
    });
    
    const protocolDistribution = Object.entries(protocolCounts)
      .map(([protocol, { packets, bytes }]) => ({ 
        protocol: protocol as any, 
        packets, 
        bytes 
      }));
    
    return {
      overallTraffic: recentTraffic,
      topSources,
      topDestinations,
      protocolDistribution,
      activeSessions: sessions,
      alerts
    };
  }, [traffic, sessions, alerts]);
  
  return {
    traffic,
    sessions,
    alerts,
    isMonitoring,
    thresholds,
    realtimeTraffic,
    selectedAttackDemo,
    toggleMonitoring,
    acknowledgeAlert,
    updateThresholds,
    selectAttackDemo,
    stats: computeNetworkStats()
  };
}
