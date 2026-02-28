/**
 * Sheet History Panel
 * Shows recent operations and activity
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Clipboard, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryOperation {
  id: string;
  type: 'copy' | 'paste' | 'delete' | 'update' | 'create';
  pageName: string;
  affectedRows: number;
  timestamp: number;
  reversible: boolean;
}

interface SheetHistoryPanelProps {
  operations: HistoryOperation[];
  isLoading?: boolean;
  maxItems?: number;
}

export function SheetHistoryPanel({
  operations,
  isLoading = false,
  maxItems = 10,
}: SheetHistoryPanelProps) {
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'copy':
        return <Copy size={16} className="text-blue-600" />;
      case 'paste':
        return <Clipboard size={16} className="text-green-600" />;
      case 'delete':
        return <Trash2 size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getOperationColor = (type: string) => {
    switch (type) {
      case 'copy':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'paste':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'delete':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'copy':
        return 'outline';
      case 'paste':
        return 'default';
      case 'delete':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const recentOps = operations.slice(-maxItems).reverse();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock size={18} />
          Recent Activity
        </CardTitle>
        <CardDescription>Last {maxItems} operations</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border border-gray-300 border-t-blue-600"></div>
          </div>
        ) : recentOps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No operations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOps.map((op) => (
              <div
                key={op.id}
                className={`border rounded-lg p-3 flex items-center gap-3 transition-colors hover:bg-gray-50 ${getOperationColor(op.type)}`}
              >
                <div className="flex-shrink-0">{getOperationIcon(op.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm capitalize">{op.type}</span>
                    <Badge variant={getTypeBadgeVariant(op.type)} className="text-xs">
                      {op.affectedRows} rows
                    </Badge>
                    {!op.reversible && (
                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                        Irreversible
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">
                    Page: <span className="font-semibold">{op.pageName}</span>
                  </p>
                </div>

                <div className="flex-shrink-0 text-xs text-gray-500 whitespace-nowrap">
                  {format(new Date(op.timestamp), 'HH:mm:ss')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
