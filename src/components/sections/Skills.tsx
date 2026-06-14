import type { SiteSection } from '@/types';
import { getSkillCategoryTitle, sortSkills } from '@/utils/skills';
import { getSkillIconClass, getSkillTooltip, isDeviconSkill } from '@/utils/skillIcons';

interface SkillsProps {
  section: SiteSection;
  skills: Record<string, string[]>;
}

function SkillTag({ skill }: { skill: string }) {
  const iconClass = getSkillIconClass(skill);
  const useDevicon = isDeviconSkill(skill);
  const tooltip = getSkillTooltip(skill);

  return (
    <span
      className="skill-tag"
      data-tooltip={tooltip}
      tabIndex={0}
      aria-label={tooltip}
    >
      <i
        className={useDevicon ? iconClass : `skill-tag-icon ${iconClass}`}
        aria-hidden="true"
      />
      <span>{skill}</span>
    </span>
  );
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
                {sortSkills(skills[key]).map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
