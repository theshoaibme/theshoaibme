import { useEffect, useMemo, useState } from 'react';

interface HeroColorTextProps {
  text: string;
  className?: string;
  id?: string;
  speed?: number;
}

type AnimationPhase = 'converting' | 'hold' | 'rolling-back' | 'idle';

export function HeroColorText({
  text,
  className = '',
  id,
  speed = 18,
}: HeroColorTextProps) {
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

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [phase, setPhase] = useState<AnimationPhase>('converting');

  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('hold');
      setActiveIndex(totalChars);
      return;
    }

    let isCancelled = false;
    let timerId: ReturnType<typeof setTimeout>;

    const getDelay = (char: string | undefined): number => {
      if (!char) return speed;
      if (char === ',' || char === '—') return Math.max(speed, 65);
      if (char === '.') return Math.max(speed, 85);
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

    const startCycle = () => {
      if (isCancelled) return;
      setPhase('converting');
      setActiveIndex(-1);

      let current = -1;

      const advanceChar = () => {
        if (isCancelled) return;
        current += 1;
        setActiveIndex(current);

        if (current < totalChars) {
          const nextChar = getCharAtGlobalIndex(current);
          const isLineEnd = lineMetadata.some((meta) => meta.startIndex + meta.length === current + 1);
          const delay = isLineEnd ? Math.max(speed, 75) : getDelay(nextChar);
          timerId = setTimeout(advanceChar, delay);
        } else {
          // Finished converting all characters: Hold in full color
          setPhase('hold');
          timerId = setTimeout(() => {
            if (isCancelled) return;
            // Begin reverse rollback: un-colors from end back to beginning
            setPhase('rolling-back');
            let rollbackCurrent = totalChars - 1;
            setActiveIndex(rollbackCurrent);

            const rollbackChar = () => {
              if (isCancelled) return;
              rollbackCurrent -= 1;
              setActiveIndex(rollbackCurrent);

              if (rollbackCurrent >= 0) {
                const prevChar = getCharAtGlobalIndex(rollbackCurrent);
                const isLineStart = lineMetadata.some((meta) => meta.startIndex === rollbackCurrent + 1);
                const rollbackDelay = isLineStart ? Math.max(speed, 60) : getDelay(prevChar);
                timerId = setTimeout(rollbackChar, rollbackDelay);
              } else {
                // Fully rolled back to base color: brief rest then start again
                setPhase('idle');
                setActiveIndex(-1);
                timerId = setTimeout(() => {
                  if (isCancelled) return;
                  startCycle();
                }, 750);
              }
            };

            timerId = setTimeout(rollbackChar, getDelay(getCharAtGlobalIndex(rollbackCurrent)));
          }, 3000);
        }
      };

      // Initial delay before starting character illumination
      timerId = setTimeout(advanceChar, 250);
    };

    startCycle();

    return () => {
      isCancelled = true;
      clearTimeout(timerId);
    };
  }, [totalChars, lineMetadata, speed]);

  const handleRestart = () => {
    setActiveIndex(totalChars);
    setPhase('hold');
  };

  return (
    <p
      className={`description max-w-[720px] mb-[30px] text-[1.15rem] font-normal tracking-[-0.2px] leading-[1.65] text-[var(--hero-beam-base,var(--text-secondary))] cursor-default ${className}`.trim()}
      id={id}
      onClick={handleRestart}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="block">
        {lineMetadata.map((meta, lineIndex) => {
          const lineStart = meta.startIndex;

          return (
            <span key={lineIndex} className="block mb-1.5 whitespace-normal break-words last:mb-0">
              {Array.from(meta.line).map((char, charIdx) => {
                const globalIdx = lineStart + charIdx;

                let charClasses = 'inline transition-colors duration-100 ease-out text-[var(--hero-beam-base,var(--text-secondary))]';

                if (phase === 'hold') {
                  charClasses = 'inline transition-colors duration-100 ease-out text-[var(--google-blue)] dark:text-[#8ab4f8]';
                } else if (phase === 'converting' || phase === 'rolling-back') {
                  if (globalIdx < activeIndex) {
                    charClasses = 'inline transition-colors duration-100 ease-out text-[var(--google-blue)] dark:text-[#8ab4f8]';
                  } else if (globalIdx === activeIndex) {
                    charClasses = 'inline transition-all duration-75 ease-out text-[#1a73e8] dark:text-[#ffffff] [text-shadow:0_0_8px_rgba(26,115,232,0.7),0_0_14px_rgba(26,115,232,0.4)] dark:[text-shadow:0_0_10px_rgba(255,255,255,0.95),0_0_18px_rgba(138,180,248,0.8)]';
                  }
                }

                return (
                  <span
                    key={charIdx}
                    className={charClasses}
                  >
                    {char}
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
