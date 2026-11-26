export interface ResumeEducationItem {
  date: string;
  degree: string;
  institution: string;
  detail: string;
}

export interface ResumeProjectItem {
  date: string;
  title: string;
  techStack: string;
  description: string;
  github?: string;
  liveDemo?: string;
}

export interface ResumeReferenceItem {
  name: string;
  lines: string[];
  email: string;
  phone?: string;
}

export interface ResumeSkillGroup {
  label: string;
  items: string;
}

export interface ResumeWorkExperienceItem {
  date: string;
  role: string;
  project: string;
  description: string;
}

export interface ResumeContent {
  personal: {
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    github: string;
    sex: string;
    dateOfBirth: string;
    photo: string;
  };
  about: string;
  workExperience: ResumeWorkExperienceItem[];
  education: ResumeEducationItem[];
  projectsPage1: ResumeProjectItem[];
  projectsPage2: ResumeProjectItem[];
  skills: ResumeSkillGroup[];
  references: ResumeReferenceItem[];
  declaration: string;
}

export const RESUME_CONTENT: ResumeContent = {
  personal: {
    name: 'MD Shoaib Khan',
    email: 'theshoaib.me@gmail.com',
    phone: '+8801909978166',
    address: 'Daffodil Smart City, Ashulia, Dhaka',
    website: 'https://theshoaib.me',
    github: 'https://github.com/theshoaibme',
    sex: 'Male',
    dateOfBirth: '1 December 2001',
    photo: '/images/about/resume-profile.webp',
  },
  about:
    'I am MD Shoaib Khan, a motivated Computer Science student focused on AI and full-stack development. I specialize in designing scalable, innovative solutions using modern technologies. Committed to continuous growth, I excel at solving complex problems and delivering high-quality software. I aim to contribute my skills to forward-thinking organizations and grow as a technology leader. I thrive in collaborative environments where creativity and teamwork drive success. Passionate about learning, I stay updated with industry trends to deliver impactful results.',
  workExperience: [
    {
      date: '(2026 - Present)',
      role: 'Backend Developer',
      project: 'CSE-TECH: Center for Software Development & Emerging Tech',
      description:
        'Developing and maintaining scalable backend services, RESTful APIs, and PostgreSQL database architectures. Collaborating with cross-functional engineering teams to design system workflows, ensure code quality, and deliver reliable production software.',
    },
    {
      date: '(February, 2024 - Present)',
      role: 'AI Engineer & Full Stack Developer',
      project: 'Freelance & Production Full-Stack AI Systems',
      description:
        'Designed and built full-stack web and AI systems integrating LLMs, multi-agent workflows, and real-time APIs. Delivered end-to-end client platforms using modern frameworks, relational/vector databases, and containerized cloud deployments.',
    },
  ],
  education: [
    {
      date: '(November 2022 - Present)',
      degree: 'BSc. in Computer Science and Engineering',
      institution: 'Daffodil International University, Dhaka, Bangladesh',
      detail: 'CGPA - On Going (CSE)',
    },
    {
      date: '(January 2019 – December 2021)',
      degree: 'Higher Secondary Certificate in Science, Class XII',
      institution: 'Birshreshtha Munshi Abdur Rouf Public College, Dhaka, Bangladesh',
      detail: 'CGPA: 4.58/5.00',
    },
    {
      date: '(2013 - 2015)',
      degree: 'Secondary School Certificate in Science, Class X',
      institution: 'Gazipur Shaheen Cadet Academy, Gazipur, Dhaka, Bangladesh',
      detail: 'GPA: 5.00/5.00',
    },
  ],
  projectsPage1: [
    {
      date: '(2026 - Present)',
      title: 'CSE Tech – ESS Portal (Enterprise ERP & Workplace Platform)',
      techStack:
        'Laravel 13, PHP 8.2+, React, Inertia.js, Tailwind CSS, PostgreSQL, Spatie RBAC, TOTP/Email 2FA, Cloudflare Turnstile, MCP, AI Integrations, Google Workspace, Git, Telegram, WhatsApp, Meta APIs, Docker.',
      description:
        'Built an enterprise ERP and Employee Self-Service (ESS) platform covering project, task, staff, and payroll management, source/Git version control, and granular RBAC with 2FA/Turnstile security. Integrated AI and MCP workflows alongside Google Workspace, Telegram, WhatsApp, and Facebook APIs.',
      liveDemo: 'https://csetech.diu.edu.bd',
    },
    {
      date: '(2026 - Present)',
      title: 'BMS Agents – Hybrid Rust & Python Autonomous Agent Runtime',
      techStack:
        'Rust (Axum Gateway), Python (FastAPI), Multi-Agent Orchestration, MCP Server, Whisper, LiveKit CallSim, Browser Automation, Sandbox Execution, RBAC Guardrails.',
      description:
        'Engineered a high-performance hybrid Rust + Python autonomous agent runtime with an Axum gateway, MCP tool server, real-time Voice CallSim, browser automation, sandboxed code execution, and EN/BN/Banglish support.',
      liveDemo: 'https://bms.theshoaib.me',
    },
  ],
  projectsPage2: [
    {
      date: '(2026 - Present)',
      title: 'BMS – Multi-Tenant Business Management & E-Commerce Platform',
      techStack:
        'Laravel 11, Next.js, React, TypeScript, Inertia.js, PostgreSQL, FastAPI, Rust, Vision OCR, Docker',
      description:
        'Built a multi-tenant SaaS business and e-commerce management platform with 3 portals (Super Admin, Merchant Workspace, Customer Gateway), CRM, inventory, subscriptions, usage-based billing, and AI integration.',
      liveDemo: 'https://bms.theshoaib.me',
    },
    {
      date: '(2026 - Present)',
      title: 'Pan-Organ Net – Multi-Modality Medical Imaging Framework',
      techStack:
        'Python, PyTorch, Self-Supervised Learning, Sparse Top-2 MoE, Conformal Calibration, XAI, Pytest',
      description:
        'Developed a unified 2D + 2.5D multi-modality clinical imaging foundation framework across 5 modalities (CT, MRI, X-Ray, Ultrasound, Mammography) and 6 specialties with SSL pretraining, MT-MoE, and leakage-audited pipelines.',
      liveDemo: 'https://huggingface.co/theshoaibme/PanOrgan-4.1',
    },
    {
      date: '(Mid 2026 - Present)',
      title: 'Learning Management System',
      techStack:
        'Laravel 13, PHP 8.3+, React, Inertia.js, Vite, Laravel Octane, Redis, Horizon, PostgreSQL, Docker',
      description:
        'Developed a multi-role learning management system for Student, Parent, Teacher, and Admin portals with course delivery, assignments, timed auto-graded quizzes, and Redis/Horizon queues.',
      liveDemo: 'https://theshoaib.me/#portfolio',
    },
    {
      date: '(2026 - Present)',
      title: 'SobujBD – National Tree Plantation & AI Verification Platform',
      techStack:
        'React, Vite, Spring Boot, FastAPI, PostGIS, Redis, MinIO, YOLOv8, Tesseract, Docker, Turborepo',
      description:
        'Built a national tree plantation tracking platform with AR verification and an AI engine using YOLOv8 and Tesseract OCR, backed by Spring Boot, FastAPI, PostGIS, and MinIO.',
      liveDemo: 'https://theshoaib.me/#portfolio',
    },
    {
      date: '(2025 - Present)',
      title: 'Doctor Portfolio – Clinical Operations & Patient Portal',
      techStack:
        'Laravel 12, PHP 8.3, React, Inertia.js, PostgreSQL, Redis, Tailwind CSS, shadcn/ui, Laravel Reverb, Docker',
      description:
        'Built a production healthcare platform combining a public website with an admin portal for appointments, chamber management, patient records, and live chat, secured with Google SSO, WebAuthn, and 2FA.',
      liveDemo: 'https://orthopedicsurgeonrahman.com/',
    },
  ],
  skills: [
    {
      label: 'Languages',
      items: 'C, C++, C#, Dart, Java, JavaScript, PHP, Python, Rust, TypeScript',
    },
    {
      label: 'Frontend',
      items: 'HTML5, CSS3, React, Next.js, Vue.js, Angular, Inertia.js, Tailwind CSS, shadcn/ui, Bootstrap',
    },
    {
      label: 'Backend',
      items: 'Laravel, Node.js, Express.js, FastAPI, Django, Flask, Spring Boot, Axum, GraphQL, Kafka, Prisma, TypeORM',
    },
    { label: 'Mobile', items: 'Flutter, React Native, Android (Kotlin), SwiftUI' },
    {
      label: 'AI & Data Science',
      items: 'PyTorch, TensorFlow, LangGraph, LangChain, MCP, OpenCV, YOLOv8, Tesseract OCR, Whisper, Scikit-learn, Pandas, Seaborn, Vector DB (Qdrant)',
    },
    { label: 'Databases', items: 'PostgreSQL, PostGIS, MySQL, MongoDB, Redis, SQLite, MinIO' },
    {
      label: 'DevOps & Cloud',
      items: 'Docker, Kubernetes, AWS, GCP, Azure, Vercel, Cloudflare, Git, GitHub Actions, Terraform, Ansible, Nginx, Bash, Linux, Firebase',
    },
    {
      label: 'Tools & Platforms',
      items: 'VS Code, Postman, Electron, Figma, LiveKit, Photoshop, Filmora',
    },
    { label: 'Soft Skills', items: 'Problem Solving, Communication, Teamwork, Agile' },
  ],
  references: [
    {
      name: 'Engineer Sheikh Ismail Hossein',
      lines: ['Senior Software Engineer,', 'DevStation39 (USA)'],
      email: 'sheikhismailhossein02@gmail.com',
    },
  ],
  declaration:
    'I hereby declare that the information stated above is true to the best of my knowledge.',
};
