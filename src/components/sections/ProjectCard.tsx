import type { Project } from '@/types';
import { getProjectImage } from '@/utils/projects';
import { isSafeExternalUrl } from '@/utils/urlValidation';

interface ProjectCardProps {
  project: Project;
  index?: number;
  animate?: boolean;
  onImageClick?: (imageUrl: string) => void;
}

export default function ProjectCard({
  project,
  index = 0,
  animate = true,
  onImageClick,
}: ProjectCardProps) {
  const projectImg = getProjectImage(project);

  return (
    <div
      className={`project-card${animate ? ' reveal' : ''} relative border-none rounded-[28px] bg-[var(--muted)] p-5 transition-all duration-300 cursor-default h-full flex flex-col`}
      style={animate ? { transitionDelay: `${index * 80}ms` } : undefined}
    >
      <div
        className={`project-img${projectImg ? ' loading' : ' no-image'} relative w-full mb-4 border-none rounded-[16px] bg-[var(--background)] overflow-hidden aspect-video aspect-[16/9] flex items-center justify-center${onImageClick && projectImg ? ' cursor-pointer' : ''}`}
        onClick={onImageClick && projectImg ? () => onImageClick(projectImg) : undefined}
        role={onImageClick && projectImg ? 'button' : undefined}
        tabIndex={onImageClick && projectImg ? 0 : undefined}
        onKeyDown={
          onImageClick && projectImg
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onImageClick(projectImg);
                }
              }
            : undefined
        }
        aria-label={onImageClick && projectImg ? `View full image for ${project.name}` : undefined}
      >
        {projectImg ? (
          <img
            src={projectImg}
            alt={project.name}
            className="project-card-img w-full h-full opacity-0 transition-[transform_0.6s_cubic-bezier(0.4,0,0.2,1),opacity_0.5s_ease] object-cover object-top aspect-video aspect-[16/9]"
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
        <div className="img-fallback absolute inset-0 -z-[1] flex items-center justify-center w-full h-full bg-[var(--background)] text-[var(--text-secondary)] text-[2rem] aspect-video aspect-[16/9]" />
      </div>
      <div className="project-content flex flex-col grow">
        <h3 className="mb-2 text-[var(--text-color)] font-heading text-[1.25rem] font-semibold leading-[1.2]">{project.name}</h3>
        <p className="mb-3 text-[var(--text-secondary)] text-[0.9rem] leading-[1.5]">{project.description}</p>
        <div className="tech-stack flex flex-wrap gap-[6px] my-2 mb-4">
          {project.tech_stack.map((tech) => (
            <span key={tech} className="tech-tag py-[3px] px-[10px] rounded-[100px] bg-[var(--background)] text-[var(--muted-foreground)] text-[0.65rem] font-medium">
              {tech}
            </span>
          ))}
        </div>
        <div className="project-links flex gap-4 mt-auto pt-[14px]">
          {isSafeExternalUrl(project.repository) ? (
            <a href={project.repository} target="_blank" rel="noreferrer noopener" className="project-link flex items-center gap-[6px] text-[var(--primary)] text-[0.82rem] font-semibold transition-opacity duration-200 hover:opacity-70">
              <i className="fa-brands fa-github" /> Source
            </a>
          ) : null}
          {project.live_preview && isSafeExternalUrl(project.live_preview) ? (
            <a
              href={project.live_preview}
              target="_blank"
              rel="noreferrer noopener"
              className="project-link demo-link flex items-center gap-[6px] text-[var(--primary)] text-[0.82rem] font-semibold transition-opacity duration-200 hover:opacity-70"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" /> Live Preview Link
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
