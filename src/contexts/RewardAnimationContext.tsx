import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CoinFlyAnimation } from '@/components/CoinFlyAnimation';
import { XPGainToast } from '@/components/XPGainToast';

interface RewardAnimationContextType {
  triggerCoinFly: (amount?: number) => void;
  triggerXPGain: (amount: number) => void;
}

const RewardAnimationContext = createContext<RewardAnimationContextType>({
  triggerCoinFly: () => {},
  triggerXPGain: () => {},
});

export function useRewardAnimation() {
  return useContext(RewardAnimationContext);
}

export function RewardAnimationProvider({ children }: { children: ReactNode }) {
  const [coinFly, setCoinFly] = useState<{ key: number; amount: number } | null>(null);
  const [xpGain, setXPGain] = useState<{ key: number; amount: number } | null>(null);

  const triggerCoinFly = useCallback((amount = 0) => {
    setCoinFly({ key: Date.now(), amount });
  }, []);

  const triggerXPGain = useCallback((amount: number) => {
    setXPGain({ key: Date.now(), amount });
  }, []);

  return (
    <RewardAnimationContext.Provider value={{ triggerCoinFly, triggerXPGain }}>
      {children}
      {coinFly && (
        <CoinFlyAnimation
          key={coinFly.key}
          amount={coinFly.amount}
          onComplete={() => setCoinFly(null)}
        />
      )}
      {xpGain && (
        <XPGainToast
          key={xpGain.key}
          amount={xpGain.amount}
          onComplete={() => setXPGain(null)}
        />
      )}
    </RewardAnimationContext.Provider>
  );
}
