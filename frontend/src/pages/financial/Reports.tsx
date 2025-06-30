import { useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import ExportButtons from "@/components/ui/ExportButtons";
import { exportService } from "@/services/exportService";
import { Download } from "lucide-react";
import { FinancialReportFilters } from "@/components/financial/FinancialReportFilters";
import { FinancialReportCharts } from "@/components/financial/FinancialReportCharts";
import { usePaymentStore } from "@/store/usePaymentStore";

const FinancialReportsPage = () => {
  useAuthGuard(["financial"]);
  const { financialReport, fetchFinancialReport, isLoading } =
    usePaymentStore();

  useEffect(() => {
    fetchFinancialReport();
  }, [fetchFinancialReport]);

  const handleFilter = (filters: {
    startDate?: string;
    endDate?: string;
    paymentType?: string;
    status?: string;
    studentId?: string;
  }) => {
    fetchFinancialReport(filters);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports"
        description="Analyze and export detailed financial reports for the university"
        action={{
          label: "Download All Reports",
          icon: Download,
          onClick: () => exportService.exportPaymentsPDF(),
        }}
      />

      <FinancialReportFilters onFilter={handleFilter} />

      <div className="flex justify-end mb-4">
        <ExportButtons
          onExportPDF={() => exportService.exportPaymentsPDF()}
          onExportExcel={() => exportService.exportPaymentsExcel()}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : financialReport ? (
        <FinancialReportCharts report={financialReport} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No financial data available
        </div>
      )}
    </div>
  );
};

export default FinancialReportsPage;
