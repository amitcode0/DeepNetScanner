
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkStats } from '@/types/network';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AttackLogsProps {
  stats: NetworkStats;
}

const AttackLogs: React.FC<AttackLogsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <Card className="bg-cyber-darker border-cyber-blue/20">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cyber-light-blue">Top Source IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-cyber-light-blue">IP Address</TableHead>
                <TableHead className="text-cyber-light-blue text-right">Packets/s</TableHead>
                <TableHead className="text-cyber-light-blue text-right">Bytes/s</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topSources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                stats.topSources.map((source, index) => (
                  <TableRow key={index} className="border-gray-800">
                    <TableCell className="font-medium">{source.ip}</TableCell>
                    <TableCell className="text-right">{source.packets.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{source.bytes.toFixed(0)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="bg-cyber-darker border-cyber-blue/20">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cyber-light-blue">Top Destination IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-cyber-light-blue">IP Address</TableHead>
                <TableHead className="text-cyber-light-blue text-right">Packets/s</TableHead>
                <TableHead className="text-cyber-light-blue text-right">Bytes/s</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topDestinations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                stats.topDestinations.map((dest, index) => (
                  <TableRow key={index} className="border-gray-800">
                    <TableCell className="font-medium">{dest.ip}</TableCell>
                    <TableCell className="text-right">{dest.packets.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{dest.bytes.toFixed(0)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttackLogs;
