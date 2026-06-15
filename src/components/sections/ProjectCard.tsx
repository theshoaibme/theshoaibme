import type { Project } from '@/types';
import { getProjectImage } from '@/utils/projects';
import { isSafeExternalUrl } from '@/utils/urlValidation';

interface ProjectCardProps {
  project: Project;
  index?: number;
  animate?: boolean;
}

export default function ProjectCard({ project, index = 0, animate = true }: ProjectCardProps) {
  const projectImg = getProjectImage(project);

  return (
    <div
      className={`project-card${animate ? ' reveal' : ''}`}
      style={animate ? { transitionDelay: `${index * 80}ms` } : undefined}
    >
      <div className={`project-img${projectImg ? ' loading' : ' no-image'}`}>
        {projectImg ? (
          <img
            src={projectImg}
            alt={project.name}
            className="project-card-img"
            onLoad={(event) => {
              const img = event.currentTarget;
              img.classList.add('loaded');
              img.parentElement?.classList.remove('loading');
            }}
            onError={(event) => {
              const img = event.currentTarget;
              img.style.display = 'none';
              img.parentElement?.classList.remove('loading');
              img.parentElement?.classList.add('no-image');
            }}
          />
        ) : null}
        <div className="img-fallback" />
      </div>
      <div className="project-content">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="tech-stack">
          {project.tech_stack.map((tech) => (
            <span key={tech} className="tech-tag">
              {tech}
            </span>
          ))}
        </div>
        <div className="project-links">
          {isSafeExternalUrl(project.repository) ? (
            <a href={project.repository} target="_blank" rel="noreferrer noopener" className="project-link">
              <i className="fa-brands fa-github" /> Source
            </a>
          ) : null}
          {project.live_preview && isSafeExternalUrl(project.live_preview) ? (
            <a
              href={project.live_preview}
              target="_blank"
              rel="noreferrer noopener"
              className="project-link demo-link"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" /> Live Preview Link
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
