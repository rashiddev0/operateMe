import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Vehicle manufacturers and their models
const vehicleManufacturers = {
  Hyundai: {
    label: "هيونداي / Hyundai",
    models: [
      { value: "Staria", label: "ستاريا / Staria" }
    ]
  },
  GMC: {
    label: "جي ام سي / GMC",
    models: [
      { value: "Yukon", label: "يوكن / Yukon" },
      { value: "Acadia", label: "أكاديا / Acadia" },
      { value: "Sierra", label: "سييرا / Sierra" }
    ]
  },
  Chevrolet: {
    label: "شيفروليه / Chevrolet",
    models: [
      { value: "Suburban", label: "سوبربان / Suburban" },
      { value: "Tahoe", label: "تاهو / Tahoe" },
      { value: "Traverse", label: "ترافيرس / Traverse" }
    ]
  }
};

export default function VehicleForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");

  // Query to check if user already has vehicles
  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles/driver"],
  });

  const form = useForm({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      type: '',
      model: '',
      year: '',
      plateNumber: ''
    }
  });

  // If user already has vehicles registered, show message instead of form
  if (vehicles && vehicles.length > 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">{t('vehicle.registered')}</p>
            <p className="text-sm text-muted-foreground">
              {t('vehicle.noAdditional')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleManufacturerChange = (value: string) => {
    setSelectedManufacturer(value);
    form.setValue('type', value);
    form.setValue('model', ''); // Reset model when manufacturer changes
  };

  const onSubmit = async (data: any) => {
    try {
      if (!selectedFiles || selectedFiles.length === 0) {
        toast({
          title: t('notifications.error'),
          description: t('vehicle.photoRequired'),
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();

      formData.append('type', data.type);
      formData.append('model', data.model);
      formData.append('year', data.year);
      formData.append('plateNumber', data.plateNumber);

      Array.from(selectedFiles).forEach((file) => {
        formData.append('photos', file);
      });

      const response = await apiRequest("POST", "/api/vehicles", formData);
      const vehicle = await response.json();

      toast({
        title: t('notifications.success'),
        description: t('vehicle.registrationSuccess'),
        variant: "default",
      });

      form.reset();
      setPhotoPreview([]);
      setSelectedFiles(null);
      setSelectedManufacturer("");

      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/driver"] });
    } catch (error: any) {
      toast({
        title: t('notifications.error'),
        description: error.message || t('vehicle.registrationError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFiles(files);
      const previews = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotoPreview(previews);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicle.manufacturer')}</FormLabel>
                  <Select
                    onValueChange={handleManufacturerChange}
                    value={selectedManufacturer}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('vehicle.selectManufacturer')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(vehicleManufacturers).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicle.model')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedManufacturer}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('vehicle.selectModel')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedManufacturer &&
                        vehicleManufacturers[selectedManufacturer as keyof typeof vehicleManufacturers].models.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicle.year')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="2020" type="number" min="1900" max="2025" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicle.plateNumber')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('vehicle.plateNumberPlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>{t('vehicle.photos')}</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </FormControl>
              <FormMessage />
              {photoPreview.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {photoPreview.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </FormItem>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? t('vehicle.saving') : t('vehicle.save')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}