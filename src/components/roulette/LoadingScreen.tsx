// src/components/LoadingScreen.tsx
import { useEffect } from 'react';

const TRANSITION_LENGTH = 1000; 

interface LoadingScreenProps {
  logoUrl: string;
  loadedAmount: number; 
  onLoaded: () => void; 
}

export const LoadingScreen = ({ logoUrl, loadedAmount, onLoaded }: LoadingScreenProps) => {

  useEffect(() => {
    if (loadedAmount >= 1) {
      const timer = setTimeout(() => {
        onLoaded();
      }, TRANSITION_LENGTH);

      return () => clearTimeout(timer);
    }
  }, [loadedAmount, onLoaded]);

  const progressBarWidth = `${loadedAmount * 100}%`;

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-gray-900'>
      
      <img
        src={logoUrl}
        alt='Loading Logo'
        className='w-48 h-48 animate-pulse'
      />

      <div className='w-64 h-4 mt-8 bg-gray-700 rounded-full overflow-hidden'>
        <div
          className='h-full bg-blue-500 rounded-full transition-all duration-1000 ease-in-out'
          style={{ width: progressBarWidth }}
        ></div>
      </div>
    </div>
  );
};