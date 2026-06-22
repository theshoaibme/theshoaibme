import type { Profile } from '@/types';
import { isSafeExternalUrl } from '@/utils/urlValidation';

interface HeroProps {
  profile: Profile;
  profileImageUrl: string;
  onProfileClick: () => void;
}

export default function Hero({ profile, profileImageUrl, onProfileClick }: HeroProps) {
  return (
    <section id="hero" className="hero">
      <div className="container hero-container">
        <div className="hero-content fade-in-up">
          <span className="subtitle">Hello, I&apos;m</span>
          <h1 className="title" id="hero-name">
            {profile.name}
          </h1>
          <p className="description" id="hero-desc">
            {profile.description}
          </p>
          <div className="hero-btns">
            <a href="#portfolio" className="btn btn-primary ripple">
              View My Work
            </a>
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
