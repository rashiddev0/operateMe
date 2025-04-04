import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle2, Upload } from "lucide-react";

export default function DriverProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [idPreview, setIdPreview] = useState<string | null>(user?.idDocumentUrl || null);
  const [licensePreview, setLicensePreview] = useState<string | null>(user?.licenseDocumentUrl || null);
  const [profilePreview, setProfilePreview] = useState<string | null>(user?.profileImageUrl || null);

  const isImageFile = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension || '');
  };

  const uploadDocument = async (file: File, type: 'id' | 'license' | 'profile') => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);

      const response = await apiRequest("POST", "/api/documents/upload", formData);
      const updatedUser = await response.json();

      // Update preview based on document type
      if (type === 'id') {
        setIdPreview(updatedUser.idDocumentUrl);
      } else if (type === 'license') {
        setLicensePreview(updatedUser.licenseDocumentUrl);
      } else if (type === 'profile') {
        setProfilePreview(updatedUser.profileImageUrl);
      }

      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], updatedUser);

      toast({
        title: t('notifications.success'),
        description: t('notifications.uploadSuccess'),
      });
    } catch (error: any) {
      toast({
        title: t('notifications.error'),
        description: t('notifications.uploadError'),
        variant: "destructive",
      });
    }
  };

  const renderPreview = (url: string | null, type: string) => {
    if (!url) return null;

    if (isImageFile(url)) {
      return (
        <div className="mt-2">
          <img 
            src={`/uploads/${url}`} 
            alt={`${type} preview`} 
            className="max-w-sm rounded-lg shadow-lg"
          />
        </div>
      );
    } else {
      return (
        <div className="mt-2">
          <a 
            href={`/uploads/${url}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {t('notifications.viewDocument')}
          </a>
        </div>
      );
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            {profilePreview ? (
              <AvatarImage src={`/uploads/${profilePreview}`} alt="Profile" />
            ) : (
              <AvatarFallback>
                <UserCircle2 className="h-16 w-16" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Add UID display here */}
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">
              {t('driver.uniqueId')}
            </div>
            <div className="text-lg font-bold">
              {user.uid}
            </div>
          </div>

          {!profilePreview && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadDocument(file, 'profile');
                }}
                className="hidden"
                id="profileImage"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('profileImage')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('driver.uploadProfileImage')}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t('auth.fullName')}</Label>
          <Input value={user.fullName || ''} disabled />
        </div>

        <div className="space-y-2">
          <Label>{t('auth.idNumber')}</Label>
          <Input value={user.idNumber || ''} disabled />
          {!idPreview && (
            <div className="mt-2">
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadDocument(file, 'id');
                }}
                className="hidden"
                id="idDocument"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('idDocument')?.click()}
              >
                {t('driver.uploadId')}
              </Button>
            </div>
          )}
          {renderPreview(idPreview, 'ID')}
        </div>

        <div className="space-y-2">
          <Label>{t('auth.licenseNumber')}</Label>
          <Input value={user.licenseNumber || ''} disabled />
          {!licensePreview && (
            <div className="mt-2">
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadDocument(file, 'license');
                }}
                className="hidden"
                id="licenseDocument"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('licenseDocument')?.click()}
              >
                {t('driver.uploadLicense')}
              </Button>
            </div>
          )}
          {renderPreview(licensePreview, 'License')}
        </div>
      </CardContent>
    </Card>
  );
}