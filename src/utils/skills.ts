export const SKILL_CATEGORIES: Record<string, string> = {
  programming_languages: 'Programming Languages',
  frontend: 'Frontend Development',
  backend_and_apis: 'Backend & APIs',
  mobile_development: 'Mobile Development',
  ai_machine_learning: 'AI & Machine Learning',
  databases: 'Databases',
  devops_and_tools: 'DevOps & Cloud',
  tools_and_ides: 'IDEs & Tools',
  design_and_media: 'Design & Media',
};

export function getSkillCategoryTitle(key: string): string {
  return SKILL_CATEGORIES[key] || key.replace(/_/g, ' ');
}

export function sortSkills(skills: string[]): string[] {
  return [...skills].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }),
  );
}

export function formatSkillsForResume(
  skills: Record<string, string[]>,
): { label: string; items: string }[] {
  return Object.keys(skills).map((key) => ({
    label: getSkillCategoryTitle(key),
    items: sortSkills(skills[key]).join(', '),
  }));
}
