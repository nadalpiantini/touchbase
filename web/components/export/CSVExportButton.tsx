'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface CSVExportButtonProps {
  type: 'players' | 'teachers' | 'classes';
  label?: string;
}

export function CSVExportButton({ type, label = 'Export CSV' }: CSVExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/export/csv?type=${type}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${type}-${new Date().toISOString().split('T')[0]}.csv`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={exporting}
      size="sm"
    >
      {exporting ? 'Exporting...' : label}
    </Button>
  );
}

