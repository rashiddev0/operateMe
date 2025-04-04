import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodePreview } from './QRCodePreview';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  qrData?: string;
  onError?: (error: Error) => void;
}

export function PDFViewer({ pdfUrl, title, qrData, onError }: PDFViewerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [pdfUrl]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/uploads/${pdfUrl}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfUrl;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('pdf.downloadError'),
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(new Error('PDF loading failed'));
    }
    toast({
      title: t('pdf.loadError'),
      description: t('pdf.tryAgain'),
      variant: "destructive",
    });
  };

  return (
    <Card className="p-6 bg-background">
      <div className="space-y-4">
        {title && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex gap-2">
              {qrData && (
                <QRCodePreview 
                  qrData={qrData} 
                  title={t('qr.documentTitle', { title })}
                />
              )}
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('pdf.download')}
              </Button>
            </div>
          </div>
        )}

        <div className="relative aspect-[16/9] w-full bg-muted rounded-lg overflow-hidden">
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-4 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-destructive font-medium">
                {t('pdf.loadError')}
              </p>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('common.retry')}
              </Button>
            </div>
          ) : (
            <iframe
              key={`${pdfUrl}-${retryCount}`}
              src={`/uploads/${pdfUrl}#view=FitH`}
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
              onError={handleError}
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}