import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { User } from "@shared/schema";

interface SearchAndFilterProps {
  onSearch: (searchTerm: string) => void;
  onFilter: (filters: any) => void;
  type: 'drivers' | 'orders' | 'documents';
  className?: string;
  driversList?: User[];
}

export default function SearchAndFilter({ onSearch, onFilter, type, className, driversList }: SearchAndFilterProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<Date>();
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setDate(undefined);
    onFilter({});
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <Input
        placeholder={t('search.placeholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-xs"
      />

      {type === 'drivers' && (
        <>
          <Select onValueChange={(value) => handleFilterChange('registrationDate', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filter.registrationDate')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('filter.today')}</SelectItem>
              <SelectItem value="week">{t('filter.thisWeek')}</SelectItem>
              <SelectItem value="month">{t('filter.thisMonth')}</SelectItem>
            </SelectContent>
          </Select>

          {driversList && driversList.length > 0 && (
            <Select onValueChange={(value) => handleFilterChange('driverName', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filter.selectDriver')} />
              </SelectTrigger>
              <SelectContent>
                {driversList.map((driver) => (
                  <SelectItem key={driver.id} value={driver.fullName || ''}>
                    {driver.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </>
      )}

      {type === 'orders' && (
        <>
          <Select onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filter.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('filter.active')}</SelectItem>
              <SelectItem value="completed">{t('filter.completed')}</SelectItem>
              <SelectItem value="cancelled">{t('filter.cancelled')}</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : t('filter.selectDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  handleFilterChange('date', newDate);
                }}
              />
            </PopoverContent>
          </Popover>
        </>
      )}

      {type === 'documents' && (
        <>
          <Select onValueChange={(value) => handleFilterChange('documentType', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filter.documentType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">{t('filter.idDocument')}</SelectItem>
              <SelectItem value="license">{t('filter.licenseDocument')}</SelectItem>
              <SelectItem value="registration">{t('filter.registrationDocument')}</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      {Object.keys(filters).length > 0 && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={clearFilters}
          className="h-10 w-10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}