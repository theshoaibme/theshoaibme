import type { ExperienceItem } from '@/types';

interface ExperienceProps {
  experience: ExperienceItem[];
}

export default function Experience({ experience }: ExperienceProps) {
  return (
    <section id="experience" className="section experience">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-subtitle">My Journey</span>
          <h2 className="section-title">Work Experience</h2>
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
