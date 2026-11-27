import type { Profile, SiteSection } from '@/types';
import { isSafeExternalUrl } from '@/utils/urlValidation';
import { getSocialLabel } from '@/utils/contactLinks';
import { LiquidCtaButton } from '@/components/buttons/LiquidCtaButton';
import { HeroColorText } from '@/components/effects/HeroColorText';
import { HERO_LABELS } from '@/data/heroData';

interface HeroProps {
  section?: SiteSection;
  profile: Profile;
  profileImageUrl: string;
  onProfileClick: () => void;
}

export default function Hero({ section, profile, profileImageUrl, onProfileClick }: HeroProps) {
  return (
    <section id="hero" className="hero">
      <div className="container hero-container">
        <div className="hero-content fade-in-up">
          <span className="subtitle">{section?.subtitle ?? HERO_LABELS.defaultGreeting}</span>
          <h1 className="title" id="hero-name">
            {profile.name}
          </h1>
          <HeroColorText
            text={profile.description}
            id="hero-desc"
          />
          <div className="hero-btns">
            <LiquidCtaButton href="#portfolio">
              {HERO_LABELS.viewWork}
            </LiquidCtaButton>
            <a href="#contact" className="btn btn-outline ripple">
              {HERO_LABELS.contactMe}
            </a>
          </div>
          <div className="social-links" id="hero-social">
            {profile.social.map((link) => {
              if (!isSafeExternalUrl(link.url)) return null;
              const label = getSocialLabel(link.url, link.icon);
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  title={label}
                >
                  <i className={link.icon} aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </a>
              );
            })}
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
              <img
                src={profileImageUrl}
                alt="3D developer workspace illustration"
                id="hero-img"
                loading="eager"
                width={460}
                height={460}
                fetchPriority="high"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
