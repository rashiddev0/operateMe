import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ text, size = 'md' }: LoadingSpinnerProps) => {
  const { t } = useTranslation();

  const sizes = {
    sm: {
      wrapper: "w-8 h-8",
      icon: "w-6 h-6",
      text: "text-xs"
    },
    md: {
      wrapper: "w-12 h-12",
      icon: "w-8 h-8",
      text: "text-sm"
    },
    lg: {
      wrapper: "w-16 h-16",
      icon: "w-12 h-12",
      text: "text-base"
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className={`relative ${sizes[size].wrapper}`}>
        {/* Outer spinning circle */}
        <motion.div
          className={`absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full ${sizes[size].wrapper}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Lightning bolt icon */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`absolute inset-0 m-auto text-primary ${sizes[size].icon}`}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </motion.svg>
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`${sizes[size].text} text-muted-foreground text-center`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};