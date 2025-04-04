import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanyMappingSchema, type CompanyMapping, type InsertCompanyMapping } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CompanyMappingWizard() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: mappings, isLoading } = useQuery<CompanyMapping[]>({
    queryKey: ['/api/company-mappings'],
  });

  const form = useForm<InsertCompanyMapping>({
    resolver: zodResolver(insertCompanyMappingSchema),
    defaultValues: {
      vehicleType: '',
      vehicleModel: '',
      companyName: '',
      companyNameAr: ''
    }
  });

  const addMutation = useMutation({
    mutationFn: async (data: InsertCompanyMapping) => {
      const res = await apiRequest('POST', '/api/company-mappings', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-mappings'] });
      form.reset();
      toast({
        title: "Success",
        description: "Company mapping added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PATCH', `/api/company-mappings/${id}/toggle`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-mappings'] });
      toast({
        title: "Success",
        description: "Company mapping status updated",
      });
    }
  });

  const onSubmit = (data: InsertCompanyMapping) => {
    addMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Company Name Mapping Wizard</h2>
        <p className="text-muted-foreground">
          Manage company names for different vehicle types and models
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. hyundai, gmc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. staria, all" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyNameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name (Arabic)</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={addMutation.isPending}
            className="w-full"
          >
            {addMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Mapping
          </Button>
        </form>
      </Form>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">Vehicle Type</th>
              <th className="p-2 text-left">Model</th>
              <th className="p-2 text-left">Company Name</th>
              <th className="p-2 text-left">Company Name (AR)</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings?.map((mapping) => (
              <tr key={mapping.id} className="border-b">
                <td className="p-2">{mapping.vehicleType}</td>
                <td className="p-2">{mapping.vehicleModel}</td>
                <td className="p-2">{mapping.companyName}</td>
                <td className="p-2 font-arabic">{mapping.companyNameAr}</td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mapping.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {mapping.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActiveMutation.mutate(mapping.id)}
                  >
                    {mapping.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
