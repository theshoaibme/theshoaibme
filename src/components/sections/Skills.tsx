import type { SiteSection } from '@/types';
import { getSkillCategoryTitle } from '@/utils/skills';

interface SkillsProps {
  section: SiteSection;
  skills: Record<string, string[]>;
}

export default function Skills({ section, skills }: SkillsProps) {
  return (
    <section id="skills" className="section skills">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-subtitle" id="skills-subtitle">
            {section.subtitle}
          </span>
          <h2 className="section-title" id="skills-title">
            {section.title}
          </h2>
        </div>
        <div className="skills-container" id="skills-container">
          {Object.keys(skills).map((key, index) => (
            <div
              key={key}
              className="skill-category reveal"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <h3>{getSkillCategoryTitle(key)}</h3>
              <div className="skill-list">
                {skills[key].map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
