import React, { useState } from 'react';
import { Button } from './button';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonsProps {
  onExportPDF: () => Promise<void>;
  onExportExcel: () => Promise<void>;
  className?: string;
}

/**
 * Reusable component for PDF and Excel export buttons
 */
const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportPDF,
  onExportExcel,
  className = '',
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      await onExportPDF();
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await onExportExcel();
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExportingPDF}
        className="flex items-center gap-1"
      >
        {isExportingPDF ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Export PDF
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        disabled={isExportingExcel}
        className="flex items-center gap-1"
      >
        {isExportingExcel ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Export Excel
      </Button>
    </div>
  );
};

export default ExportButtons;
