import { useEffect, useState } from 'react';

const messages = [
  'CALCULATING...',
  'DESIGN AND CODE HANDMADE',
  'OPTIMIZING...',
  'LOADING...',
  'RUNNING CREATIVITY PROTOCOLS',
  'PREPARING...',
  'STILL POINTLESS'
];

export function ConsoleText() {
  const [lines, setLines] = useState<string[]>(['> SYSTEM READY']);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage = `> ${messages[messageIndex]}`;
      
      setLines((prevLines) => {
        const newLines = [...prevLines, newMessage];
        // Keep only the last 3 lines
        return newLines.slice(-3);
      });
      
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [messageIndex]);

  return (
    <div className="font-mono text-[9px] leading-[1.4] h-[42px] overflow-hidden flex flex-col justify-end">
      {lines.map((line, index) => (
        <div
          key={`${line}-${index}`}
          className="console-line"
          style={{
            opacity: index === lines.length - 1 ? 1 : 0.4 - (lines.length - 1 - index) * 0.2,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}