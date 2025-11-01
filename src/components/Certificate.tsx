import { Certificate } from "@/lib/certificateManager";
import { Award, Download } from "lucide-react";
import { Button } from "./ui/button";

interface CertificateProps {
  certificate: Certificate;
}

export const CertificateComponent = ({ certificate }: CertificateProps) => {
  const handleDownload = () => {
    const element = document.getElementById('certificate-content');
    if (!element) return;

    // Create a new window for printing
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const styles = `
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .certificate-print {
          width: 1000px;
          margin: 0 auto;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    `;

    printWindow.document.write(styles + '<div class="certificate-print">' + element.innerHTML + '</div>');
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-end mb-3 no-print">
        <Button onClick={handleDownload} className="gap-2 touch-target">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      <div id="certificate-content" className="relative bg-card p-6 rounded-xl shadow-lg border-2 border-primary/20">
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/40 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />

        {/* Inner Content */}
        <div className="relative bg-card p-6 rounded-lg border border-border">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Award className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">LearningHub</h1>
                <p className="text-xs text-muted-foreground">Certificate of Completion</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground mt-1">Workshop</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-4 mb-8">
            <p className="text-sm text-muted-foreground">This certificate is awarded to</p>
            
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {certificate.studentName}
            </h2>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                For successfully completing the workshop
              </p>
              <h3 className="text-lg font-semibold text-foreground">
                {certificate.workshopTitle}
              </h3>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between pt-6 border-t border-border">
            <div>
              <p className="text-base font-semibold text-foreground">{formattedDate}</p>
              <p className="text-xs text-muted-foreground">Date of Completion</p>
            </div>

            <div className="text-right">
              <p className="text-lg font-signature text-foreground mb-1" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                {certificate.instructorName}
              </p>
              <p className="text-xs text-muted-foreground">
                Workshop Instructor
              </p>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              ID: {certificate.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
