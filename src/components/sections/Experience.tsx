import type { ExperienceItem, SiteSection } from '@/types';

interface ExperienceProps {
  section: SiteSection;
  experience: ExperienceItem[];
}

export default function Experience({ section, experience }: ExperienceProps) {
  return (
    <section id="experience" className="section experience">
      <div className="container">
        <div className="section-header reveal">
          <h2 className="section-title">{section.title}</h2>
        </div>
        <div className="experience-timeline" id="experience-timeline">
          {experience.map((item, index) => (
            <div key={`${item.role}-${item.duration}`} className="timeline-item">
              <div className="timeline-marker">
                <div className={`timeline-dot timeline-dot-${index % 3}`} />
              </div>
              <div className="timeline-content">
                <span className="timeline-date">{item.duration}</span>
                <h3>{item.role}</h3>
                <h4>{item.company}</h4>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
