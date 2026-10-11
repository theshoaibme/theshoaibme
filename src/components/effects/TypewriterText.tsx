import { useEffect, useMemo, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  id?: string;
  speed?: number;
}

export function TypewriterText({
  text,
  className = '',
  id,
  speed = 24,
}: TypewriterTextProps) {
  const lines = useMemo(() => {
    if (text.includes('\n')) {
      return text.split('\n').filter((line) => line.length > 0);
    }
    return [text];
  }, [text]);

  const lineMetadata = useMemo(() => {
    let runningCount = 0;
    return lines.map((line) => {
      const startIndex = runningCount;
      runningCount += line.length;
      return { line, startIndex, length: line.length };
    });
  }, [lines]);

  const totalChars = useMemo(() => {
    return lineMetadata.reduce((acc, curr) => acc + curr.length, 0);
  }, [lineMetadata]);

  const [revealedCount, setRevealedCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealedCount(totalChars);
      return;
    }

    setRevealedCount(0);
    let currentIndex = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const getDelay = (char: string | undefined): number => {
      if (!char) return speed;
      if (char === ',' || char === '—') return speed + 90;
      if (char === '.') return speed + 120;
      return speed;
    };

    const getCharAtGlobalIndex = (idx: number): string | undefined => {
      for (const meta of lineMetadata) {
        if (idx >= meta.startIndex && idx < meta.startIndex + meta.length) {
          return meta.line[idx - meta.startIndex];
        }
      }
      return undefined;
    };

    const typeNext = () => {
      if (currentIndex >= totalChars) return;
      currentIndex += 1;
      setRevealedCount(currentIndex);

      if (currentIndex < totalChars) {
        const nextChar = getCharAtGlobalIndex(currentIndex);
        const isLineEnd = lineMetadata.some((meta) => meta.startIndex + meta.length === currentIndex);
        const delay = isLineEnd ? speed + 130 : getDelay(nextChar);
        timerId = setTimeout(typeNext, delay);
      }
    };

    timerId = setTimeout(typeNext, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [totalChars, lineMetadata, speed]);

  const handleRevealAll = () => {
    setRevealedCount(totalChars);
  };

  return (
    <p
      className={`description max-w-[720px] mb-[30px] text-[1.15rem] font-normal tracking-[-0.2px] leading-[1.65] text-[var(--text-secondary)] cursor-default ${className}`.trim()}
      id={id}
      onClick={handleRevealAll}
      title="Click to reveal all"
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="block">
        {lineMetadata.map((meta, lineIndex) => {
          const lineStart = meta.startIndex;
          const lineEnd = meta.startIndex + meta.length;
          const isCursorOnThisLine =
            (revealedCount >= lineStart && revealedCount < lineEnd) ||
            (revealedCount >= totalChars && lineIndex === lineMetadata.length - 1);

          return (
            <span key={lineIndex} className="block mb-1.5 whitespace-normal break-words last:mb-0">
              {revealedCount === lineStart && isCursorOnThisLine ? (
                <span className="inline-block w-[2px] h-[1.15em] ml-[2px] -mr-[2px] align-[-0.15em] bg-[var(--google-blue)] shadow-[0_0_8px_var(--google-blue)] rounded-[1px] animate-pulse pointer-events-none" />
              ) : null}
              {Array.from(meta.line).map((char, charIdx) => {
                const globalIdx = lineStart + charIdx;
                const isRevealed = globalIdx < revealedCount;
                const isActive = globalIdx === revealedCount - 1 && revealedCount < totalChars;
                const showCursorAfterChar = isCursorOnThisLine && globalIdx === revealedCount - 1;

                let charClasses = 'inline transition-all duration-300 ease-out ';
                if (!isRevealed) {
                  charClasses += 'opacity-0 select-none pointer-events-none';
                } else if (isActive) {
                  charClasses += 'opacity-100 text-[var(--google-blue)] [text-shadow:0_0_10px_rgba(26,115,232,0.6)]';
                } else {
                  charClasses += 'opacity-100 text-inherit';
                }

                return (
                  <span key={charIdx} className="inline">
                    <span className={charClasses}>
                      {char}
                    </span>
                    {showCursorAfterChar ? (
                      <span className="inline-block w-[2px] h-[1.15em] ml-[2px] -mr-[2px] align-[-0.15em] bg-[var(--google-blue)] shadow-[0_0_8px_var(--google-blue)] rounded-[1px] animate-pulse pointer-events-none" />
                    ) : null}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </p>
  );
}
