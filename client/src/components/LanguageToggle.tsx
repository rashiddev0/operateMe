import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import i18n from "@/lib/i18n";

const languages = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" }
];

export default function LanguageToggle() {
  const { t } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    // Save language preference to localStorage
    localStorage.setItem('language', langCode);

    // Update document direction
    document.dir = langCode === "ar" ? "rtl" : "ltr";

    // Change language in i18n
    i18n.changeLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {languages.find(lang => lang.code === i18n.language)?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}