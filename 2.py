#!/usr/bin/env python3
import socket
import threading
import ipaddress
from datetime import datetime
import argparse

class NetworkScanner:
    def __init__(self, target, start_port=1, end_port=1024, timeout=1):
        self.target = target
        self.start_port = start_port
        self.end_port = end_port
        self.timeout = timeout
        self.open_ports = []
        
    def scan_port(self, port):
        """Scan a single port"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            result = sock.connect_ex((self.target, port))
            if result == 0:
                service = self.get_service_name(port)
                self.open_ports.append((port, service))
            sock.close()
        except:
            pass

    def get_service_name(self, port):
        """Get service name for a port"""
        try:
            service = socket.getservbyport(port)
            return service
        except:
            return "unknown"

    def scan(self):
        """Start the network scan"""
        print(f"\nStarting scan on host {self.target}")
        print("=" * 50)
        start_time = datetime.now()

        threads = []
        for port in range(self.start_port, self.end_port + 1):
            thread = threading.Thread(target=self.scan_port, args=(port,))
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        end_time = datetime.now()
        total_time = end_time - start_time

        # Print results
        print("\nScan completed!")
        print(f"Time taken: {total_time}")
        print("\nOpen ports:")
        for port, service in sorted(self.open_ports):
            print(f"Port {port}: {service}")

def main():
    parser = argparse.ArgumentParser(description="Network Port Scanner")
    parser.add_argument("target", help="Target IP address to scan")
    parser.add_argument("-s", "--start-port", type=int, default=1, help="Starting port number")
    parser.add_argument("-e", "--end-port", type=int, default=1024, help="Ending port number")
    parser.add_argument("-t", "--timeout", type=float, default=1.0, help="Timeout duration for each port")
    
    args = parser.parse_args()

    try:
        # Validate IP address
        ipaddress.ip_address(args.target)
        
        scanner = NetworkScanner(
            args.target,
            args.start_port,
            args.end_port,
            args.timeout
        )
        scanner.scan()
    except ValueError:
        print("Error: Invalid IP address")
    except KeyboardInterrupt:
        print("\nScan interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
    