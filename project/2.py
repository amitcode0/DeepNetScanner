#!/usr/bin/env python3
import socket
import threading
import ipaddress
from datetime import datetime
import argparse
import json

class NetworkScanner:
    def __init__(self, target, start_port=1, end_port=1024, timeout=1):
        self.target = target
        self.start_port = start_port
        self.end_port = end_port
        self.timeout = timeout
        self.open_ports = []
        self.scan_results = {
            "target": target,
            "timestamp": datetime.now().isoformat(),
            "ports": []
        }
        
    def scan_port(self, port):
        """Scan a single port"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            result = sock.connect_ex((self.target, port))
            if result == 0:
                service = self.get_service_name(port)
                self.open_ports.append((port, service))
                self.scan_results["ports"].append({
                    "port": port,
                    "service": service,
                    "status": "open"
                })
            sock.close()
        except Exception as e:
            self.scan_results["ports"].append({
                "port": port,
                "status": "error",
                "error": str(e)
            })

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

        # Create thread pool
        threads = []
        for port in range(self.start_port, self.end_port + 1):
            thread = threading.Thread(target=self.scan_port, args=(port,))
            threads.append(thread)
            thread.start()

            # Limit concurrent threads
            if len(threads) >= 100:
                for t in threads:
                    t.join()
                threads = []

        # Wait for remaining threads
        for thread in threads:
            thread.join()

        end_time = datetime.now()
        total_time = end_time - start_time
        
        self.scan_results["duration"] = str(total_time)
        self.scan_results["total_ports_scanned"] = self.end_port - self.start_port + 1
        self.scan_results["open_ports_count"] = len(self.open_ports)

        # Print results
        print("\nScan completed!")
        print(f"Time taken: {total_time}")
        print("\nOpen ports:")
        for port, service in sorted(self.open_ports):
            print(f"Port {port}: {service}")
        
        return self.scan_results

    def get_json_results(self):
        """Return scan results in JSON format"""
        return json.dumps(self.scan_results, indent=2)

def scan_network(target_ip, start_port=1, end_port=1024, timeout=1.0):
    """Function to be called from web interface"""
    try:
        ipaddress.ip_address(target_ip)
        scanner = NetworkScanner(target_ip, start_port, end_port, timeout)
        results = scanner.scan()
        return results
    except ValueError:
        return {"error": "Invalid IP address"}
    except Exception as e:
        return {"error": str(e)}

def main():
    parser = argparse.ArgumentParser(description="DeepNetScanner - Network Port Scanner")
    parser.add_argument("target", help="Target IP address to scan")
    parser.add_argument("-s", "--start-port", type=int, default=1, help="Starting port number")
    parser.add_argument("-e", "--end-port", type=int, default=1024, help="Ending port number")
    parser.add_argument("-t", "--timeout", type=float, default=1.0, help="Timeout duration for each port")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    
    args = parser.parse_args()

    try:
        results = scan_network(args.target, args.start_port, args.end_port, args.timeout)
        if args.json:
            print(json.dumps(results, indent=2))
    except KeyboardInterrupt:
        print("\nScan interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
    