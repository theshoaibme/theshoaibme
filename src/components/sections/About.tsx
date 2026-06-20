import { Link } from 'react-router-dom';
import type { About, SiteSection } from '@/types';

interface AboutProps {
  section: SiteSection;
  about: About;
  aboutImage: string;
  profileName: string;
  onImageClick?: () => void;
}

export default function About({
  section,
  about,
  aboutImage,
  profileName,
  onImageClick,
}: AboutProps) {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-subtitle" id="about-subtitle">
            {section.subtitle}
          </span>
          <h2 className="section-title" id="about-title">
            {section.title}
          </h2>
        </div>
        <div className="about-content reveal">
          <div className="about-text" id="about-text">
            {about.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="about-actions">
              <Link to="/resume" className="btn btn-outline ripple">
                View Resume
              </Link>
            </div>
          </div>
          <div className="about-visual">
            <div
              className="about-img-container"
              {...(onImageClick ? { 'data-tooltip': 'Click to show full view' } : {})}
              onClick={onImageClick}
              onKeyDown={(event) => {
                if (onImageClick && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onImageClick();
                }
              }}
              role={onImageClick ? 'button' : undefined}
              tabIndex={onImageClick ? 0 : undefined}
              aria-label={onImageClick ? `View ${profileName} profile photo` : undefined}
            >
              <img
                src={aboutImage}
                alt={profileName}
                className="about-img"
                id="about-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="stats reveal" id="about-stats">
          {about.stats.map((stat) => (
            <div key={stat.label} className="stat-item" data-tooltip={stat.label}>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
