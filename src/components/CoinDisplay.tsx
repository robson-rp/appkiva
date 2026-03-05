import { motion } from 'framer-motion';

interface CoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function CoinDisplay({ amount, size = 'md', label }: CoinDisplayProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-2">
      <motion.span
        key={amount}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className={`${sizes[size]} select-none`}
      >
        🪙
      </motion.span>
      <div>
        <motion.span
          key={amount}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-display font-bold ${sizes[size]}`}
        >
          {amount}
        </motion.span>
        {label && <p className="text-xs text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}
