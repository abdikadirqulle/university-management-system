import { api } from './api';

/**
 * Interface for report filters
 */
interface ReportFilters {
  academicYear: string;
  semester: string;
}

/**
 * Service for handling PDF and Excel exports
 */
class ExportService {
  /**
   * Download a file from the specified endpoint
   * @param endpoint - API endpoint to fetch the file from
   * @param filename - Name to save the file as
   * @param openInBrowser - Whether to open the file in browser (true) or download it (false)
   */
  /**
   * Download a file from the specified endpoint
   * @param endpoint - API endpoint to fetch the file from
   * @param filename - Name to save the file as
   * @param openInBrowser - Whether to open the file in browser (true) or download it (false)
   */
  private async downloadFile(endpoint: string, filename: string, openInBrowser: boolean = false): Promise<void> {
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob'
      });
      
      // Determine content type based on file extension
      const isPdf = filename.toLowerCase().endsWith('.pdf');
      const contentType = isPdf ? 'application/pdf' : 'application/octet-stream';

      
      // Create a blob with the correct MIME type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      if (openInBrowser && isPdf) {
        // Open PDF in a new tab
        this.openPdfInBrowser(url);
      } else {
        // Download the file
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      // Clean up the blob URL after a delay to ensure it's used
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
  
  /**
   * Opens a PDF in the browser
   * @param url - The blob URL of the PDF
   */
  private openPdfInBrowser(url: string): void {
    // Create an iframe to display the PDF
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    try {
      // Try to open in a new tab first
      const newWindow = window.open(url, '_blank');
      
      // If popup is blocked or fails, fallback to embedded viewer
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Create a more reliable fallback using Google PDF Viewer
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        window.open(googleViewerUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening PDF in browser:', error);
      // Final fallback - just try direct URL
      window.open(url, '_blank');
    } finally {
      // Clean up the iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  }
  
  // Student exports
  
  /**
   * Export students data as PDF
   */
  async exportStudentsPDF(): Promise<void> {
    return this.downloadFile('/export/students/pdf', 'students.pdf', true);
  }
  
  /**
   * Export students data as Excel
   */
  async exportStudentsExcel(): Promise<void> {
    return this.downloadFile('/export/students/excel', 'students.xlsx');
  }
  
  // Course exports
  
  /**
   * Export courses data as PDF
   */
  async exportCoursesPDF(): Promise<void> {
    return this.downloadFile('/export/courses/pdf', 'courses.pdf', true);
  }
  
  /**
   * Export courses data as Excel
   */
  async exportCoursesExcel(): Promise<void> {
    return this.downloadFile('/export/courses/excel', 'courses.xlsx');
  }
  
  // Payment exports
  
  /**
   * Export payments data as PDF
   * @param viewInBrowser - Whether to view the PDF in browser (true) or download it (false)
   */
  async exportPaymentsPDF(viewInBrowser: boolean = false): Promise<void> {
    return this.downloadFile('/export/payments/pdf', 'payments.pdf', viewInBrowser);
  }
  
  /**
   * Export payments data as Excel
   */
  async exportPaymentsExcel(): Promise<void> {
    return this.downloadFile('/export/payments/excel', 'payments.xlsx');
  }
  
  /**
   * Export transaction history for a specific student as PDF
   * @param studentId - The ID of the student
   */
  async exportStudentTransactionPDF(studentId: string): Promise<void> {
    return this.downloadFile(`/student-transactions/${studentId}/pdf`, `student_${studentId}_transactions.pdf`, true);
  }

  // Report exports

  /**
   * Export enrollment trends report as PDF
   * @param filters - Report filters (academicYear, semester)
   */
  async exportEnrollmentTrendsPDF(filters: ReportFilters): Promise<void> {
    const { academicYear, semester } = filters;
    return this.downloadFile(
      `/reports/enrollment-trends/pdf?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(semester)}`,
      `enrollment-trends-${academicYear}-${semester}.pdf`,
      true
    );
  }

  /**
   * Export enrollment trends report as Excel
   * @param filters - Report filters (academicYear, semester)
   */
  async exportEnrollmentTrendsExcel(filters: ReportFilters): Promise<void> {
    const { academicYear, semester } = filters;
    return this.downloadFile(
      `/reports/enrollment-trends/excel?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(semester)}`,
      `enrollment-trends-${academicYear}-${semester}.xlsx`
      
    );
  }

  /**
   * Export faculty distribution report as PDF
   * @param filters - Report filters (academicYear, semester)
   */
  async exportFacultyDistributionPDF(filters: ReportFilters): Promise<void> {
    const { academicYear, semester } = filters;
    return this.downloadFile(
      `/reports/faculty-distribution/pdf?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(semester)}`,
      `faculty-distribution-${academicYear}-${semester}.pdf`,
      true
    );
  }

  /**
   * Export faculty distribution report as Excel
   * @param filters - Report filters (academicYear, semester)
   */
  async exportFacultyDistributionExcel(filters: ReportFilters): Promise<void> {
    const { academicYear, semester } = filters;
    return this.downloadFile(
      `/reports/faculty-distribution/excel?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(semester)}`,
      `faculty-distribution-${academicYear}-${semester}.xlsx`
    );
  }

  /**
   * Export course enrollment report as PDF
   * @param filters - Report filters (academicYear, semester)
   */
  async exportCourseEnrollmentPDF(filters: ReportFilters): Promise<void> {
    console.log(filters)
    const { academicYear, semester } = filters;
    return this.downloadFile(
      `/reports/course-enrollment/pdf?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(semester)}`,
      `course-enrollment-${academicYear}-${semester}.pdf`,
        true
    );
  }

  /**
   * Export course enrollment report as Excel
   * @param filters - Report filters (academicYear, semester)
   */
  async exportCourseEnrollmentExcel(filters: ReportFilters): Promise<void> {
    const { academicYear, semester } = filters;
    return this.downloadFile(
      `/reports/course-enrollment/excel?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(semester)}`,
      `course-enrollment-${academicYear}-${semester}.xlsx`
    );
  }

  /**
   * Export enrollment by department report as PDF
   * @param filters - Report filters (academicYear, semester)
   */
  async exportEnrollmentByDepartmentPDF(filters: ReportFilters): Promise<void> {
    const { academicYear, semester } = filters;
    return this.downloadFile(
      `/reports/enrollment-by-department/pdf?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(semester)}`,
      `enrollment-by-department-${academicYear}-${semester}.pdf`,
      true
    );
  }

  /**
   * Export enrollment by department report as Excel
   * @param filters - Report filters (academicYear, semester)
   */
  async exportEnrollmentByDepartmentExcel(filters: ReportFilters): Promise<void> {
    const { academicYear, semester } = filters;
    return this.downloadFile(
      `/reports/enrollment-by-department/excel?academicYear=${encodeURIComponent(academicYear)}&semester=${encodeURIComponent(semester)}`,
      `enrollment-by-department-${academicYear}-${semester}.xlsx`
    );
  }
}

export const exportService = new ExportService();
