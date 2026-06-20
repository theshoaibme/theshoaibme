export interface NavItem {
  label: string;
  link: string;
}

export interface SiteSection {
  subtitle: string;
  title: string;
}

export interface PolicyInfo {
  title: string;
  heading: string;
  lastUpdated: string;
}

export interface SiteData {
  title: string;
  logo: {
    text: string;
    span: string;
  };
  favicon: string;
  nav: NavItem[];
  sections: Record<string, SiteSection>;
  footer: string;
  policies: {
    terms: PolicyInfo;
    privacy: PolicyInfo;
  };
  resume?: {
    title: string;
    heading: string;
    subtitle: string;
  };
}

export interface SocialLink {
  icon: string;
  url: string;
}

export interface Profile {
  name: string;
  subtitle: string;
  profileImage: string;
  description: string;
  social: SocialLink[];
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface About {
  image: string;
  text: string[];
  stats: AboutStat[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  tech_stack: string[];
  repository: string;
  image: string | null;
  live_preview: string | null;
  featured?: boolean;
}

export interface Service {
  title: string;
  icon: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  feedback: string;
  avatar: string;
}

export interface Contact {
  location: string;
  email: string;
  phone: string;
}

export interface PortfolioData {
  site: SiteData;
  profile: Profile;
  about: About;
  experience: ExperienceItem[];
  skills: Record<string, string[]>;
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  contact: Contact;
}
