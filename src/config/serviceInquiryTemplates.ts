import type { Service } from '@/types';

export interface ServiceInquiryTemplate {
  key: string;
  subject: string;
  message: string;
}

const SERVICE_KEYWORDS: Record<string, string[]> = {
  'Web Development': ['React', 'Next.js', 'responsive design', 'performance', 'SEO'],
  'Mobile App Development': ['Flutter', 'React Native', 'Android', 'iOS', 'offline-ready UX'],
  'AI Solutions': ['LLM integration', 'prompt engineering', 'vector search', 'automation', 'AI workflows'],
  'UI/UX Design': ['Figma', 'wireframes', 'accessibility', 'user-first design', 'pixel-perfect UI'],
  'Cloud & DevOps': ['AWS', 'GCP', 'Vercel', 'Docker', 'CI/CD'],
  'API & Backend': ['REST API', 'GraphQL', 'Node.js', 'Express', 'Prisma'],
  'Freelance Consulting': ['code review', 'architecture', 'MVP strategy', 'technical guidance'],
  'E-Commerce Solutions': ['online store', 'payments', 'inventory', 'admin dashboard', 'conversion'],
};

function getServiceKeywords(title: string, description: string): string[] {
  return SERVICE_KEYWORDS[title] ?? description.split(/[,—–-]/).map((part) => part.trim()).filter(Boolean).slice(0, 5);
}

export function buildServiceInquiryTemplate(service: Service): ServiceInquiryTemplate {
  const keywords = getServiceKeywords(service.title, service.description);

  return {
    key: service.title,
    subject: `${service.title} — Project Discussion`,
    message: `Hello,

I am interested in your ${service.title} service and would like to discuss a project.

Project name:
[Your project name]

Brief overview:
[Describe what you want to build]

Goals:
- 

Timeline:
[Expected start date / deadline]

Budget:
[Your budget range]

Key requirements:
${keywords.map((keyword) => `- ${keyword}`).join('\n')}

Additional notes:
[Any extra details, links, or references]

Best regards,
[Your name]`,
  };
}
