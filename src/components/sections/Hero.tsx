import type { Profile } from '@/types';

interface HeroProps {
  profile: Profile;
  onProfileClick: () => void;
}

export default function Hero({ profile, onProfileClick }: HeroProps) {
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
            {profile.social.map((link) => (
              <a key={link.url} href={link.url}>
                <i className={link.icon} />
              </a>
            ))}
          </div>
        </div>
        <div className="hero-visual fade-in-left">
          {profile.profileImage ? (
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
              <img src={profile.profileImage} alt={profile.name} id="hero-img" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
