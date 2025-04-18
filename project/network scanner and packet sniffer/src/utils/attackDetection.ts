
import { 
  TrafficDataPoint, 
  NetworkSession, 
  AttackAlert, 
  ThresholdSettings, 
  Protocol,
  AttackType,
  AttackSeverity 
} from '@/types/network';

const DEFAULT_THRESHOLDS: ThresholdSettings = {
  synFloodPacketsPerSecond: 100,
  httpFloodRequestsPerSecond: 50,
  udpFloodPacketsPerSecond: 200
};

// Detects SYN flood attacks by analyzing TCP sessions
export function detectSynFlood(
  sessions: NetworkSession[], 
  timeWindowMs: number = 5000,
  thresholds: ThresholdSettings = DEFAULT_THRESHOLDS
): AttackAlert | null {
  const now = Date.now();
  const recentSessions = sessions.filter(
    session => session.protocol === 'TCP' && 
    session.state === 'SYN_RECEIVED' &&
    now - session.lastSeen < timeWindowMs
  );
  
  // Group by destination IP to find potential targets
  const targetGroups = groupBy(recentSessions, 'destinationIP');
  
  for (const [targetIP, sessions] of Object.entries(targetGroups)) {
    // Count unique source IPs
    const uniqueSources = new Set(sessions.map(s => s.sourceIP));
    const packetsPerSecond = sessions.reduce((sum, s) => sum + s.packetCount, 0) * (1000 / timeWindowMs);

    if (packetsPerSecond > thresholds.synFloodPacketsPerSecond) {
      const sourceIPs = Array.from(uniqueSources);
      const severity = determineSeverity(packetsPerSecond, thresholds.synFloodPacketsPerSecond);
      
      return {
        id: `syn-flood-${Date.now()}`,
        timestamp: Date.now(),
        attackType: 'SYN Flood',
        severity,
        sourceIPs,
        targetIP,
        targetPort: sessions[0]?.destinationPort || 0,
        packetsPerSecond,
        duration: timeWindowMs / 1000,
        description: `Possible SYN flood detected: ${packetsPerSecond.toFixed(0)} SYN packets/sec from ${sourceIPs.length} sources`,
        acknowledged: false
      };
    }
  }
  
  return null;
}

// Detects HTTP flood attacks by analyzing HTTP/HTTPS traffic
export function detectHttpFlood(
  traffic: TrafficDataPoint[], 
  timeWindowMs: number = 10000,
  thresholds: ThresholdSettings = DEFAULT_THRESHOLDS
): AttackAlert | null {
  const now = Date.now();
  const recentTraffic = traffic.filter(
    t => (t.protocol === 'HTTP' || t.protocol === 'HTTPS') && 
    now - t.timestamp < timeWindowMs
  );
  
  // Group by destination IP
  const targetGroups = groupBy(recentTraffic, 'destinationIP');
  
  for (const [targetIP, traffic] of Object.entries(targetGroups)) {
    if (!targetIP) continue;
    
    // Count packets per second
    const packetsPerSecond = traffic.reduce((sum, t) => sum + t.packetsPerSecond, 0);
    const uniqueSources = new Set(traffic.map(t => t.sourceIP).filter(Boolean));
    
    if (packetsPerSecond > thresholds.httpFloodRequestsPerSecond) {
      const sourceIPs = Array.from(uniqueSources) as string[];
      const severity = determineSeverity(packetsPerSecond, thresholds.httpFloodRequestsPerSecond);
      
      return {
        id: `http-flood-${Date.now()}`,
        timestamp: Date.now(),
        attackType: 'HTTP Flood',
        severity,
        sourceIPs,
        targetIP,
        targetPort: traffic[0]?.destinationPort || 80,
        packetsPerSecond,
        duration: timeWindowMs / 1000,
        description: `Possible HTTP flood detected: ${packetsPerSecond.toFixed(0)} requests/sec from ${sourceIPs.length} sources`,
        acknowledged: false
      };
    }
  }
  
  return null;
}

// Detects UDP flood attacks
export function detectUdpFlood(
  traffic: TrafficDataPoint[], 
  timeWindowMs: number = 5000,
  thresholds: ThresholdSettings = DEFAULT_THRESHOLDS
): AttackAlert | null {
  const now = Date.now();
  const recentTraffic = traffic.filter(
    t => t.protocol === 'UDP' && now - t.timestamp < timeWindowMs
  );
  
  // Group by destination IP
  const targetGroups = groupBy(recentTraffic, 'destinationIP');
  
  for (const [targetIP, traffic] of Object.entries(targetGroups)) {
    if (!targetIP) continue;
    
    // Calculate packets per second
    const packetsPerSecond = traffic.reduce((sum, t) => sum + t.packetsPerSecond, 0);
    const uniqueSources = new Set(traffic.map(t => t.sourceIP).filter(Boolean));
    
    if (packetsPerSecond > thresholds.udpFloodPacketsPerSecond) {
      const sourceIPs = Array.from(uniqueSources) as string[];
      const severity = determineSeverity(packetsPerSecond, thresholds.udpFloodPacketsPerSecond);
      
      return {
        id: `udp-flood-${Date.now()}`,
        timestamp: Date.now(),
        attackType: 'UDP Flood',
        severity,
        sourceIPs,
        targetIP,
        targetPort: traffic[0]?.destinationPort || 0,
        packetsPerSecond,
        duration: timeWindowMs / 1000,
        description: `Possible UDP flood detected: ${packetsPerSecond.toFixed(0)} packets/sec from ${sourceIPs.length} sources`,
        acknowledged: false
      };
    }
  }
  
  return null;
}

// Run all detection algorithms
export function detectAttacks(
  traffic: TrafficDataPoint[], 
  sessions: NetworkSession[],
  thresholds: ThresholdSettings = DEFAULT_THRESHOLDS
): AttackAlert[] {
  const alerts: AttackAlert[] = [];
  
  const synFloodAlert = detectSynFlood(sessions, 5000, thresholds);
  const httpFloodAlert = detectHttpFlood(traffic, 10000, thresholds);
  const udpFloodAlert = detectUdpFlood(traffic, 5000, thresholds);
  
  if (synFloodAlert) alerts.push(synFloodAlert);
  if (httpFloodAlert) alerts.push(httpFloodAlert);
  if (udpFloodAlert) alerts.push(udpFloodAlert);
  
  return alerts;
}

// Helper function to determine attack severity based on threshold
function determineSeverity(
  value: number, 
  threshold: number
): AttackSeverity {
  if (value > threshold * 3) return 'High';
  if (value > threshold * 2) return 'Medium';
  if (value > threshold) return 'Low';
  return 'None';
}

// Helper function to group array elements by a key
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key] || '');
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Generate sample data for testing/demo
export function generateSampleData(includeSynFlood = false, includeHttpFlood = false, includeUdpFlood = false) {
  const now = Date.now();
  const traffic: TrafficDataPoint[] = [];
  const sessions: NetworkSession[] = [];
  
  // Generate normal background traffic
  for (let i = 0; i < 50; i++) {
    const protocol: Protocol = ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)] as Protocol;
    const timestamp = now - Math.floor(Math.random() * 30000);
    
    traffic.push({
      timestamp,
      packetsPerSecond: Math.random() * 10,
      bytesPerSecond: Math.random() * 5000,
      protocol,
      sourceIP: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      destinationIP: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
      sourcePort: Math.floor(Math.random() * 60000) + 1024,
      destinationPort: [80, 443, 8080, 22, 25][Math.floor(Math.random() * 5)]
    });
    
    sessions.push({
      id: `session-${i}`,
      sourceIP: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      destinationIP: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
      sourcePort: Math.floor(Math.random() * 60000) + 1024,
      destinationPort: [80, 443, 8080, 22, 25][Math.floor(Math.random() * 5)],
      protocol: protocol,
      packetCount: Math.floor(Math.random() * 100),
      byteCount: Math.floor(Math.random() * 100000),
      startTime: timestamp,
      lastSeen: timestamp + Math.floor(Math.random() * 5000),
      state: ['ESTABLISHED', 'SYN_SENT', 'SYN_RECEIVED', 'FIN_WAIT', 'CLOSED'][Math.floor(Math.random() * 5)] as any
    });
  }
  
  // Add SYN flood attack data if requested
  if (includeSynFlood) {
    const targetIP = '10.0.0.1';
    const targetPort = 80;
    
    for (let i = 0; i < 200; i++) {
      const sourceIP = `45.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const sourcePort = Math.floor(Math.random() * 60000) + 1024;
      const timestamp = now - Math.floor(Math.random() * 3000);
      
      sessions.push({
        id: `syn-flood-${i}`,
        sourceIP,
        destinationIP: targetIP,
        sourcePort,
        destinationPort: targetPort,
        protocol: 'TCP',
        packetCount: 1,
        byteCount: 60,
        startTime: timestamp,
        lastSeen: timestamp,
        state: 'SYN_RECEIVED'
      });
    }
  }
  
  // Add HTTP flood attack data if requested
  if (includeHttpFlood) {
    const targetIP = '10.0.0.2';
    const targetPort = 80;
    
    for (let i = 0; i < 100; i++) {
      const sourceIP = `92.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const timestamp = now - Math.floor(Math.random() * 5000);
      
      traffic.push({
        timestamp,
        packetsPerSecond: Math.random() * 5 + 2,
        bytesPerSecond: Math.random() * 3000 + 500,
        protocol: 'HTTP',
        sourceIP,
        destinationIP: targetIP,
        sourcePort: Math.floor(Math.random() * 60000) + 1024,
        destinationPort: targetPort
      });
    }
  }
  
  // Add UDP flood attack data if requested
  if (includeUdpFlood) {
    const targetIP = '10.0.0.3';
    const targetPort = 53;
    
    for (let i = 0; i < 300; i++) {
      const sourceIP = `62.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const timestamp = now - Math.floor(Math.random() * 3000);
      
      traffic.push({
        timestamp,
        packetsPerSecond: Math.random() * 10 + 5,
        bytesPerSecond: Math.random() * 2000 + 300,
        protocol: 'UDP',
        sourceIP,
        destinationIP: targetIP,
        sourcePort: Math.floor(Math.random() * 60000) + 1024,
        destinationPort: targetPort
      });
    }
  }
  
  return { traffic, sessions };
}
