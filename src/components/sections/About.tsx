import type { About, SiteSection } from '@/types';

interface AboutProps {
  section: SiteSection;
  about: About;
}

export default function About({ section, about }: AboutProps) {
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
          </div>
        </div>
        <div className="stats reveal" id="about-stats">
          {about.stats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
