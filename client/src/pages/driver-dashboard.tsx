import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import DriverProfile from "@/components/DriverProfile";
import VehicleForm from "@/components/VehicleForm";
import OperationOrder from "@/components/OperationOrder";
import LanguageToggle from "@/components/LanguageToggle";
import { Redirect } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Calendar, MapPin, Users } from "lucide-react";
import { OperationOrder as OperationOrderType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useState, useEffect } from "react";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

function DriverDashboardContent() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Hide welcome animation after 2 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const { data: driverOrders, isLoading: isOrdersLoading, error } = useQuery<(OperationOrderType & { passengers: any[]; pdfUrl?: string })[]>({
    queryKey: ["/api/driver/orders"],
    enabled: !!user && user.role === "driver",
    onError: (error: any) => {
      if (error.message === 'notifications.sessionExpired') {
        toast({
          title: t('notifications.sessionExpired'),
          description: t('notifications.sessionExpiredMessage'),
          variant: "destructive"
        });
        logoutMutation.mutate();
      }
    }
  });

  if (isOrdersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return <Redirect to="/auth" />;
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <>
      {showWelcome && user && (
        <WelcomeAnimation 
          username={user.username} 
          role={user.role as "driver"} 
        />
      )}
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Logo size="md" />
            <div className="flex gap-4">
              <LanguageToggle />
              <button
                onClick={() => logoutMutation.mutate()}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="block lg:hidden mb-4">
            <Select value={activeTab} onValueChange={handleTabChange}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {activeTab === "profile" && t('driver.profile')}
                  {activeTab === "vehicles" && t('driver.vehicles')}
                  {activeTab === "orders" && t('driver.orders')}
                  {activeTab === "history" && t('driver.history')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile">{t('driver.profile')}</SelectItem>
                <SelectItem value="vehicles">{t('driver.vehicles')}</SelectItem>
                <SelectItem value="orders">{t('driver.orders')}</SelectItem>
                <SelectItem value="history">{t('driver.history')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="hidden lg:flex">
              <TabsTrigger value="profile">{t('driver.profile')}</TabsTrigger>
              <TabsTrigger value="vehicles">{t('driver.vehicles')}</TabsTrigger>
              <TabsTrigger value="orders">{t('driver.orders')}</TabsTrigger>
              <TabsTrigger value="history">{t('driver.history')}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <DriverProfile />
            </TabsContent>

            <TabsContent value="vehicles">
              <VehicleForm />
            </TabsContent>

            <TabsContent value="orders">
              <OperationOrder />
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">{t('driver.operationHistory')}</h2>
                  {!driverOrders?.length ? (
                    <p className="text-muted-foreground text-center py-4">{t('driver.noOrders')}</p>
                  ) : (
                    <div className="grid gap-6">
                      {driverOrders.map((order) => (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-5 w-5 text-primary" />
                                  <h3 className="text-lg font-semibold">
                                    {t('order.tripNumber')}: {order.tripNumber}
                                  </h3>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(order.createdAt).toLocaleString()}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {order.fromCity} → {order.toCity}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {t('order.passengerCount')}: {order.passengers?.length || 0}
                                  </p>
                                </div>

                                {/* Trip Details */}
                                <div className="mt-4">
                                  <Badge variant="outline" className="mb-2">
                                    {order.visaType}
                                  </Badge>
                                </div>

                                {/* Passengers Section */}
                                <div className="mt-4 space-y-2">
                                  <h4 className="font-medium">{t('order.passengers')}</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {order.passengers?.map((passenger, index) => (
                                      <div key={index} className="text-sm bg-muted p-2 rounded-md">
                                        <p className="font-medium">{passenger.name}</p>
                                        <p className="text-muted-foreground text-xs">
                                          {t('order.idNumber')}: {passenger.idNumber}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                          {t('order.nationality')}: {passenger.nationality}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Document Actions */}
                              {order.pdfUrl && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <a
                                      href={`/uploads/${order.pdfUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2"
                                    >
                                      <FileText className="h-4 w-4" />
                                      {t('order.viewDocument')}
                                    </a>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/uploads/${order.pdfUrl}`, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    {t('order.download')}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default function DriverDashboard() {
  const { user, error } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    if (error?.message === 'notifications.sessionExpired') {
      toast({
        title: t('notifications.sessionExpired'),
        description: t('notifications.sessionExpiredMessage'),
        variant: "destructive"
      });
    }
  }, [error, t, toast]);

  if (!user || user.role !== "driver") {
    return <Redirect to="/auth" />;
  }

  return <DriverDashboardContent />;
}