const DEVICON_SKILLS: Record<string, string> = {
  C: 'devicon-c-plain colored',
  'C++': 'devicon-cplusplus-plain colored',
  Python: 'devicon-python-plain colored',
  Java: 'devicon-java-plain colored',
  'C#': 'devicon-csharp-plain colored',
  PHP: 'devicon-php-plain colored',
  JavaScript: 'devicon-javascript-plain colored',
  TypeScript: 'devicon-typescript-plain colored',
  Dart: 'devicon-dart-plain colored',
  HTML5: 'devicon-html5-plain colored',
  CSS3: 'devicon-css3-plain colored',
  React: 'devicon-react-original colored',
  'Vue.js': 'devicon-vuejs-plain colored',
  'Tailwind CSS': 'devicon-tailwindcss-plain colored',
  Bootstrap: 'devicon-bootstrap-plain colored',
  'Node.js': 'devicon-nodejs-plain colored',
  'Express.js': 'devicon-express-original colored',
  Django: 'devicon-django-plain colored',
  Flask: 'devicon-flask-original colored',
  Laravel: 'devicon-laravel-plain colored',
  'Spring Boot': 'devicon-spring-plain colored',
  GraphQL: 'devicon-graphql-plain colored',
  Kafka: 'devicon-apachekafka-plain colored',
  Android: 'devicon-android-plain colored',
  Kotlin: 'devicon-kotlin-plain colored',
  Flutter: 'devicon-flutter-plain colored',
  'React Native': 'devicon-react-original colored',
  TensorFlow: 'devicon-tensorflow-original colored',
  PyTorch: 'devicon-pytorch-original colored',
  OpenCV: 'devicon-opencv-plain colored',
  'Scikit-learn': 'devicon-scikitlearn-plain colored',
  Pandas: 'devicon-pandas-plain colored',
  MySQL: 'devicon-mysql-plain colored',
  PostgreSQL: 'devicon-postgresql-plain colored',
  MongoDB: 'devicon-mongodb-plain colored',
  SQLite: 'devicon-sqlite-plain colored',
  Redis: 'devicon-redis-plain colored',
  AWS: 'devicon-amazonwebservices-plain colored',
  GCP: 'devicon-googlecloud-plain colored',
  Docker: 'devicon-docker-plain colored',
  Linux: 'devicon-linux-plain colored',
  Git: 'devicon-git-plain colored',
  Bash: 'devicon-bash-plain colored',
  'VS Code': 'devicon-vscode-plain colored',
  Firebase: 'devicon-firebase-plain colored',
  Postman: 'devicon-postman-plain colored',
  Electron: 'devicon-electron-original colored',
  'Adobe Photoshop': 'devicon-photoshop-plain colored',
};

const FONT_AWESOME_SKILLS: Record<string, string> = {
  Seaborn: 'fa-solid fa-chart-line',
  NLP: 'fa-solid fa-language',
  Filmora: 'fa-solid fa-clapperboard',
};

export function getSkillIconClass(skill: string): string {
  if (DEVICON_SKILLS[skill]) {
    return DEVICON_SKILLS[skill];
  }

  if (FONT_AWESOME_SKILLS[skill]) {
    return FONT_AWESOME_SKILLS[skill];
  }

  return 'fa-solid fa-circle-nodes';
}

export function isDeviconSkill(skill: string): boolean {
  return skill in DEVICON_SKILLS;
}
