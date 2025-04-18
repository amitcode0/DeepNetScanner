
// Network traffic types
export type Protocol = 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'ICMP' | 'Other';

export type TrafficDataPoint = {
  timestamp: number;
  packetsPerSecond: number;
  bytesPerSecond: number;
  protocol: Protocol;
  sourceIP?: string;
  destinationIP?: string;
  sourcePort?: number;
  destinationPort?: number;
};

export type NetworkSession = {
  id: string;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: Protocol;
  packetCount: number;
  byteCount: number;
  startTime: number;
  lastSeen: number;
  state?: 'ESTABLISHED' | 'SYN_SENT' | 'SYN_RECEIVED' | 'FIN_WAIT' | 'CLOSED';
};

// Attack types
export type AttackType = 'SYN Flood' | 'HTTP Flood' | 'UDP Flood' | 'None';

export type AttackSeverity = 'Low' | 'Medium' | 'High' | 'None';

export type AttackAlert = {
  id: string;
  timestamp: number;
  attackType: AttackType;
  severity: AttackSeverity;
  sourceIPs: string[];
  targetIP: string;
  targetPort: number;
  packetsPerSecond: number;
  duration: number;
  description: string;
  acknowledged: boolean;
};

export type ThresholdSettings = {
  synFloodPacketsPerSecond: number;
  httpFloodRequestsPerSecond: number;
  udpFloodPacketsPerSecond: number;
};

// For sample data generation
export type NetworkStats = {
  overallTraffic: TrafficDataPoint[];
  topSources: {ip: string, packets: number, bytes: number}[];
  topDestinations: {ip: string, packets: number, bytes: number}[];
  protocolDistribution: {protocol: Protocol, packets: number, bytes: number}[];
  activeSessions: NetworkSession[];
  alerts: AttackAlert[];
};
