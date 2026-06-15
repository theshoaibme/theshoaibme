interface LogoMarkProps {
  logoText: string;
  logoSpan: string;
}

export default function LogoMark({ logoText, logoSpan }: LogoMarkProps) {
  let charIndex = 0;
  const spanWithoutDot = logoSpan.replace(/\.$/, '');
  const hasDot = logoSpan.endsWith('.');

  return (
    <>
      {logoText.split('').map((char, index) => {
        if (char.trim() === '') {
          return <span key={`space-${index}`}>{char}</span>;
        }

        charIndex += 1;
        return (
          <span key={`char-${index}`} className={`logo-char-${charIndex}`}>
            {char}
          </span>
        );
      })}
      <span>
        {spanWithoutDot}
        {hasDot ? <span className="logo-dot">.</span> : null}
      </span>
    </>
  );
}
