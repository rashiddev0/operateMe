import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

interface Notification {
  type: 'NEW_DRIVER' | 'NEW_ORDER' | 'NEW_PDF' | 'VEHICLE_REGISTERED' | 'CONNECTION_STATUS';
  message: string;
  timestamp: Date;
  data?: any;
}

export function NotificationCenter() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date>(new Date());
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!user && user.role === 'admin',
    onSuccess: (newNotifications) => {
      if (!newNotifications.length) return;

      const latestNotification = newNotifications[0];
      if (new Date(latestNotification.timestamp) > lastNotificationTime) {
        setUnreadCount(prev => prev + 1);
        setLastNotificationTime(new Date(latestNotification.timestamp));

        // Show toast notification
        toast({
          title: t(`notifications.${latestNotification.type.toLowerCase()}`),
          description: latestNotification.message,
        });
      }
    },
  });

  const clearNotifications = () => {
    setUnreadCount(0);
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleNotifications}
        className="relative"
      >
        <Bell className="h-5 w-5 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{t('notifications.title')}</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
              >
                {t('notifications.clearAll')}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {t('notifications.noNotifications')}
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">
                        {t(`notifications.${notification.type.toLowerCase()}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.timestamp), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}