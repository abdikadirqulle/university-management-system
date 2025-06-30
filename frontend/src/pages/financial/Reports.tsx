import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import ExportButtons from "@/components/ui/ExportButtons";
import { exportService } from "@/services/exportService";
import { Download } from "lucide-react";

const FinancialReportsPage = () => {
  useAuthGuard(["financial"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports"
        description="Analyze and export detailed financial reports for the university"
        action={{
          label: "Download All Reports",
          icon: Download,
          onClick: () => console.log("Download reports"),
        }}
      />

      <div className="flex justify-end mb-4">
        <ExportButtons
          onExportPDF={() => exportService.exportPaymentsPDF()}
          onExportExcel={() => exportService.exportPaymentsExcel()}
        />
      </div>
    </div>
  );
};

export default FinancialReportsPage;
