#!/usr/bin/env python3
from scapy.all import sniff, IP, TCP, UDP, ICMP
from datetime import datetime
import argparse
import json
import signal
import sys

class PacketSniffer:
    def __init__(self, interface=None, filter=None, count=None):
        self.interface = interface
        self.filter = filter
        self.count = count
        self.packets = []
        self.running = True
        
        # Setup signal handler for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        
    def signal_handler(self, signum, frame):
        """Handle Ctrl+C"""
        print("\nStopping packet capture...")
        self.running = False
        
    def packet_callback(self, packet):
        """Process each captured packet"""
        if not self.running:
            return
            
        packet_info = {
            'timestamp': datetime.now().isoformat(),
            'length': len(packet),
            'protocol': None,
            'src_ip': None,
            'dst_ip': None,
            'src_port': None,
            'dst_port': None,
            'type': None
        }
        
        # IP packet analysis
        if IP in packet:
            packet_info['src_ip'] = packet[IP].src
            packet_info['dst_ip'] = packet[IP].dst
            
            # TCP analysis
            if TCP in packet:
                packet_info['protocol'] = 'TCP'
                packet_info['src_port'] = packet[TCP].sport
                packet_info['dst_port'] = packet[TCP].dport
                packet_info['type'] = self.get_tcp_flags(packet[TCP])
                
            # UDP analysis
            elif UDP in packet:
                packet_info['protocol'] = 'UDP'
                packet_info['src_port'] = packet[UDP].sport
                packet_info['dst_port'] = packet[UDP].dport
                packet_info['type'] = 'UDP Datagram'
                
            # ICMP analysis
            elif ICMP in packet:
                packet_info['protocol'] = 'ICMP'
                packet_info['type'] = f'ICMP type:{packet[ICMP].type}'
        
        self.packets.append(packet_info)
        self.print_packet_info(packet_info)
        
    def get_tcp_flags(self, tcp_packet):
        """Analyze TCP flags"""
        flags = []
        if tcp_packet.flags.S: flags.append('SYN')
        if tcp_packet.flags.A: flags.append('ACK')
        if tcp_packet.flags.F: flags.append('FIN')
        if tcp_packet.flags.R: flags.append('RST')
        if tcp_packet.flags.P: flags.append('PSH')
        return ' '.join(flags) if flags else 'No Flags'
        
    def print_packet_info(self, packet_info):
        """Print packet information in a readable format"""
        print("\n" + "="*70)
        print(f"Time: {packet_info['timestamp']}")
        print(f"Protocol: {packet_info['protocol']}")
        if packet_info['src_ip']:
            print(f"Source IP: {packet_info['src_ip']}", end='')
            if packet_info['src_port']:
                print(f":{packet_info['src_port']}")
            else:
                print()
        if packet_info['dst_ip']:
            print(f"Destination IP: {packet_info['dst_ip']}", end='')
            if packet_info['dst_port']:
                print(f":{packet_info['dst_port']}")
            else:
                print()
        print(f"Type: {packet_info['type']}")
        print(f"Length: {packet_info['length']} bytes")
        
    def start_sniffing(self):
        """Start packet capture"""
        print(f"\nStarting packet capture...")
        print(f"Interface: {self.interface or 'default'}")
        print(f"Filter: {self.filter or 'none'}")
        if self.count:
            print(f"Capturing {self.count} packets...")
        else:
            print("Capturing packets indefinitely (Ctrl+C to stop)...")
        
        try:
            sniff(
                iface=self.interface,
                filter=self.filter,
                prn=self.packet_callback,
                count=self.count,
                store=0
            )
        except Exception as e:
            print(f"\nError during packet capture: {e}")
            
    def get_json_results(self):
        """Return captured packets in JSON format"""
        return json.dumps({
            'packet_count': len(self.packets),
            'packets': self.packets
        }, indent=2)

def start_capture(interface=None, filter=None, count=None, json_output=False):
    """Function to be called from web interface"""
    try:
        sniffer = PacketSniffer(interface, filter, count)
        sniffer.start_sniffing()
        if json_output:
            return sniffer.get_json_results()
        return sniffer.packets
    except Exception as e:
        return {"error": str(e)}

def main():
    parser = argparse.ArgumentParser(description="DeepNetScanner - Packet Sniffer")
    parser.add_argument("-i", "--interface", help="Network interface to capture packets")
    parser.add_argument("-f", "--filter", help="BPF filter for packet capture")
    parser.add_argument("-c", "--count", type=int, help="Number of packets to capture")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    
    args = parser.parse_args()
    
    try:
        results = start_capture(args.interface, args.filter, args.count, args.json)
        if args.json:
            print(results)
    except KeyboardInterrupt:
        print("\nPacket capture stopped by user")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
