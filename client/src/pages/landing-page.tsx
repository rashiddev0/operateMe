import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import LanguageToggle from "@/components/LanguageToggle";
import { motion } from "framer-motion";
import { FaGooglePlay, FaAppStore } from "react-icons/fa";
import { Car, MapPin, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [iconIndex, setIconIndex] = React.useState(0);

  const icons = React.useMemo(() => [
    {
      Icon: Car,
      color: "text-primary",
      title: t('landing.subtitle1')
    },
    {
      Icon: MapPin,
      color: "text-primary",
      title: t('landing.subtitle2')
    },
    {
      Icon: LayoutDashboard,
      color: "text-primary",
      title: t('landing.subtitle3')
    }
  ], [t]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [icons.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 md:gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8 md:h-10 md:w-10 text-primary"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <div className={`flex items-center ${isRTL ? 'mr-2' : 'ml-2'} min-w-[150px] md:min-w-[180px]`}>
              <span className="text-lg md:text-xl font-bold text-primary whitespace-nowrap">{t('landing.brandFirst')}</span>
              <span className={`${isRTL ? 'mr-1 md:mr-2' : 'ml-1 md:ml-2'} text-lg md:text-xl font-bold text-muted-foreground whitespace-nowrap`}>
                {t('landing.brandSecond')}
              </span>
            </div>
          </motion.div>
          <LanguageToggle />
        </div>

        <div className="mt-20 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl md:text-6xl font-bold mb-6 leading-tight md:leading-normal bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              {t('landing.title')}
            </h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-32 md:h-40 flex items-center justify-center"
            >
              <motion.div
                key={iconIndex}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {React.createElement(icons[iconIndex].Icon, {
                  className: `h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 ${icons[iconIndex].color}`
                })}
                <p className="text-lg md:text-2xl text-muted-foreground">
                  {icons[iconIndex].title}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto min-w-[200px] text-lg">
                {t('landing.loginButton')}
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto min-w-[200px] text-lg"
              >
                {t('landing.adminButton')}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex justify-center gap-8 mt-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <FaGooglePlay className="h-6 w-6 md:h-8 md:w-8" />
              <span className="text-sm md:text-base">Google Play</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <FaAppStore className="h-6 w-6 md:h-8 md:w-8" />
              <span className="text-sm md:text-base">App Store</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}