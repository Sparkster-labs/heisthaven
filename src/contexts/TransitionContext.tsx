import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

interface TransitionContextType {
  transitioning: boolean;
  triggerTransition: (callback: () => void) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  transitioning: false,
  triggerTransition: () => {},
});

export const useTransition = () => useContext(TransitionContext);

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const [transitioning, setTransitioning] = useState(false);
  const busyRef = useRef(false);

  const triggerTransition = useCallback((callback: () => void) => {
    if (busyRef.current) {
      // Skip animation, execute immediately
      callback();
      return;
    }
    busyRef.current = true;
    setTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setTransitioning(false);
        busyRef.current = false;
      }, 50);
    }, 200);
  }, []);

  return (
    <TransitionContext.Provider value={{ transitioning, triggerTransition }}>
      <div
        style={{
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 200ms ease',
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
};
