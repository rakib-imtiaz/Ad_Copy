import { useEffect, useState } from 'react';
import './ShinyText.css';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText = ({ text, disabled = false, speed = 5, className = '' }: ShinyTextProps) => {
  const [isReady, setIsReady] = useState(false);
  const animationDuration = `${speed}s`;

  useEffect(() => {
    // Small delay to ensure background gradient is loaded before making text transparent
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`shiny-text ${disabled ? 'disabled' : ''} ${isReady ? 'ready' : ''} ${className}`}
      style={{ animationDuration }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
