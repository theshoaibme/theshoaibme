import type { Profile } from '@/types';
import { isSafeExternalUrl } from '@/utils/urlValidation';
import { LiquidCtaButton } from '@/components/buttons/LiquidCtaButton';

interface HeroProps {
  profile: Profile;
  profileImageUrl: string;
  onProfileClick: () => void;
}

const splitDescriptionIntoLines = (text: string): string[] => {
  if (!text) return [];
  if (text.includes(' — ')) {
    const [intro, rest] = text.split(' — ');
    if (rest.includes(' to secure backends, ')) {
      const [mid, end] = rest.split(' to secure backends, ');
      return [
        intro,
        `— ${mid} to secure backends,`,
        end,
      ];
    }
    return [intro, `— ${rest}`];
  }
  return [text];
};

export default function Hero({ profile, profileImageUrl, onProfileClick }: HeroProps) {
  const descriptionLines = splitDescriptionIntoLines(profile.description);

  return (
    <section id="hero" className="hero">
      <div className="container hero-container">
        <div className="hero-content fade-in-up">
          <span className="subtitle">Hello, I&apos;m</span>
          <h1 className="title" id="hero-name">
            {profile.name}
          </h1>
          <p
            className="description"
            id="hero-desc"
            data-beam="_r132R_2l_"
            data-active=""
          >
            {descriptionLines.map((line, index) => (
              <span
                key={index}
                className={`hero-desc-line hero-desc-line-${index + 1}`}
                data-line-index={index}
              >
                {line}
              </span>
            ))}
          </p>
          <div className="hero-btns">
            <LiquidCtaButton href="#portfolio">
              View My Work
            </LiquidCtaButton>
            <a href="#contact" className="btn btn-outline ripple">
              Contact Me
            </a>
          </div>
          <div className="social-links" id="hero-social">
            {profile.social.map((link) =>
              isSafeExternalUrl(link.url) ? (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer noopener">
                  <i className={link.icon} />
                </a>
              ) : null,
            )}
          </div>
        </div>
        <div className="hero-visual fade-in-left">
          {profileImageUrl ? (
            <div
              className="profile-img-container floating"
              onClick={onProfileClick}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onProfileClick();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <img src={profileImageUrl} alt={profile.name} id="hero-img" loading="eager" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
