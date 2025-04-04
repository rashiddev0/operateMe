```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Share2, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface QRCodePreviewProps {
  qrData: string;
  title?: string;
}

export function QRCodePreview({ qrData, title }: QRCodePreviewProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      toast({
        title: t('qr.copied'),
        description: t('qr.copiedDescription'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('qr.copyError'),
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || t('qr.shareTitle'),
          text: qrData,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: t('common.error'),
            description: t('qr.shareError'),
            variant: "destructive",
          });
        }
      }
    } else {
      await handleCopy();
    }
  };

  const handleScan = () => {
    // This will be implemented in the next iteration
    toast({
      title: t('qr.scanTitle'),
      description: t('qr.scanDescription'),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          {t('qr.preview')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t('qr.previewTitle')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <img
              src={`data:image/png;base64,${qrData}`}
              alt="QR Code"
              className="w-64 h-64"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              {t('qr.copy')}
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              {t('qr.share')}
            </Button>
            <Button onClick={handleScan} variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              {t('qr.scan')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```
