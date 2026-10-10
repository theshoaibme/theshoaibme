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
  phone: string;
}

export interface ResumeSkillGroup {
  label: string;
  items: string;
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
  workExperience: {
    date: string;
    role: string;
    project: string;
    description: string;
  };
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
    photo: 'https://avatars.githubusercontent.com/u/125272364',
  },
  about:
    'I am MD Shoaib Khan, a motivated Computer Science student focused on AI and full-stack development. I specialize in designing scalable, innovative solutions using modern technologies. Committed to continuous growth, I excel at solving complex problems and delivering high-quality software. I aim to contribute my skills to forward-thinking organizations and grow as a technology leader. I thrive in collaborative environments where creativity and teamwork drive success. Passionate about learning, I stay updated with industry trends to deliver impactful results.',
  workExperience: {
    date: '(February, 2024- Present)',
    role: 'AI Engineer & Full Stack Developer',
    project: 'AURA – Artificial Understanding & Reasoning Assistant',
    description:
      'Designed and built full-stack AI systems integrating LLMs, voice interfaces, and dynamic workflows. Worked across backend, frontend, and ML, optimizing for scalability and real-time performance. Developed plugin-based agent infrastructure using modern frameworks and open-source tools. Led end-to-end deployment and continuous improvement of AI-powered applications in production environments.',
  },
  education: [
    {
      date: '(November 2022 - December 2026)',
      degree: 'BSc. in Computer Science and Engineering(CSE)',
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
      date: '(April, 2024- Present)',
      title: 'AURA – Artificial Understanding & Reasoning Assistant',
      techStack:
        'TypeScript, Node.js, NestJS, TypeORM, React, LLMs, Whisper, TTS, WebSockets, Redis, Docker, Python (Tools), Postgres, LangChain, PNPM Monorepo.',
      description:
        'Built a modular AI agent framework with 100+ dynamic plugins for messaging (Telegram, WhatsApp, API), task automation, and multi-modal reasoning. Integrated real-time voice I/O (Speech-to-Text & TTS), vector/structured memory, and ReAct-style decision logic. Architected a custom plugin system extensible tool chaining and external service orchestration. Supports multilingual speech, microservices, and agent-level reasoning via LLMs.',
      github: 'https://github.com/theshoaibme',
      liveDemo: 'https://theshoaib.me',
    },
  ],
  projectsPage2: [
    {
      date: '(December 2024- March 2025)',
      title: 'Pregnify – AI-Powered Pregnancy Health Platform',
      techStack:
        'React.js, Node.js, Express, MongoDB, Python (ML), Docker, TensorFlow, Firebase, WebRTC, Stripe',
      description:
        'Built a multi-platform AI system to assess pregnancy risks in real time using health data and ML. Implemented secure doctor-patient video calls (WebRTC), role-based access, and integrated payments. Developed real-time dashboards, emergency alerts, and responsive UI for Web, Mobile, and Smartwatch.',
      github: 'https://github.com/theshoaibme/Pregnify',
    },
    {
      date: '(August 2024 – December 2024)',
      title: 'Super Shop Management – Full Stack E-Commerce Platform',
      techStack:
        'Java, Spring Boot, MongoDB, React.js, Maven, JWT, REST API, Docker, Microservices',
      description:
        'Built a full-stack e-commerce platform with Spring Boot and MongoDB, featuring JWT-secured APIs and role-based access. Developed React.js dashboards for product, order, and analytics management. Integrated shopping cart and order processing with a scalable payment gateway via microservices. Tested APIs with Postman and cURL, deployed secure endpoints, and used Docker for scalable infrastructure with Maven and JDK 17.',
      github: 'https://github.com/theshoaibme/Super-Shop-Management',
    },
  ],
  skills: [
    { label: 'Languages', items: 'C, C++, Python, Java, C#, JavaScript, TypeScript' },
    { label: 'Frontend', items: 'HTML5, CSS3, React, Vue, Tailwind, Bootstrap' },
    { label: 'Backend', items: 'Node.js, Express, Django, Flask, Spring Boot, GraphQL, Kafka' },
    { label: 'Mobile', items: 'React Native, Android (Kotlin)' },
    {
      label: 'AI & Data Science',
      items: 'TensorFlow, PyTorch, OpenCV, Scikit-learn, Pandas, Seaborn',
    },
    { label: 'Databases', items: 'MySQL, PostgreSQL, MongoDB, SQLite, Redis' },
    { label: 'DevOps & Cloud', items: 'Docker, Git, Bash, Linux, Firebase, AWS' },
    { label: 'Tools & Platforms', items: 'VS Code, Postman, Electron, Photoshop, Filmora' },
    { label: 'Soft Skills', items: 'Problem Solving, Communication, Teamwork, Agile' },
  ],
  references: [
    {
      name: 'Engineer Sheikh Ismail Hossein',
      lines: ['Senior Software Engineer,', 'DevStation39 (USA)'],
      email: 'sheikhismailhossein02@gmail.com',
      phone: '+8801737-308999',
    },
    {
      name: 'Professor A.M.M. Hamidur Rahman',
      lines: [
        'Professor, Department of English',
        'Faculty of Humanities & Social Science',
        'Daffodil International University',
      ],
      email: 'hamidurrahman@diu.edu.bd',
      phone: '+8801811-458889',
    },
  ],
  declaration:
    'I hereby declare that the information stated above is true to the best of my knowledge.',
};
