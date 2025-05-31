import { api } from './api';

/**
 * Service for handling PDF and Excel exports
 */
class ExportService {
  /**
   * Download a file from a URL and save it with the given filename
   * @param url - The URL to download the file from
   * @param filename - The name to save the file as
   */
  private async downloadFile(url: string, filename: string): Promise<void> {
    try {
      // Make a request to the API with responseType blob to handle binary data
      const response = await api.get(url, {
        responseType: 'blob',
      });
      
      // Create a blob URL from the response data
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      
      // Append to the document, click to download, then remove
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
  
  // Student exports
  
  /**
   * Export students data as PDF
   */
  async exportStudentsPDF(): Promise<void> {
    return this.downloadFile('/export/students/pdf', 'students.pdf');
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
    return this.downloadFile('/export/courses/pdf', 'courses.pdf');
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
   */
  async exportPaymentsPDF(): Promise<void> {
    return this.downloadFile('/export/payments/pdf', 'payments.pdf');
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
    return this.downloadFile(`/student-transactions/${studentId}/pdf`, `student_${studentId}_transactions.pdf`);
  }
}

export const exportService = new ExportService();
