import { useEffect } from 'react';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';
import { LoadingSpinner } from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

interface RouteTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: 0,
    scale: 0.96,
  },
};

export function RouteTransition({ children }: RouteTransitionProps) {
  const { isLoading } = useNavigationLoading();
  const { t } = useTranslation();
  const [location] = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <LoadingSpinner size="lg" text={t('common.loading')} />
          </motion.div>
        ) : (
          <motion.div
            key={location}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 30,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}