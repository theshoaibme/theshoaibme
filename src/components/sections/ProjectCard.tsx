"use client";

import { useEffect, useRef, useState } from 'react';
import { PROJECT_CARD_LABELS } from '@/data/portfolioData';
import type { Project } from '@/types';
import { getProjectFallbackImage, getProjectImages } from '@/utils/projects';
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
  const projectImages = getProjectImages(project);
  const fallbackImg = getProjectFallbackImage(project);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const projectImg = useFallback ? fallbackImg : (projectImages[activeIndex] ?? '');

  useEffect(() => {
    if (projectImages.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projectImages.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [projectImages.length, isPaused]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
      img.parentElement?.classList.remove('loading');
    }
  }, [projectImg]);

  return (
    <div
      className={`project-card${animate ? ' reveal' : ''} relative border-none rounded-[28px] bg-[var(--muted)] p-5 transition-all duration-300 cursor-default h-full flex flex-col`}
      style={animate ? { transitionDelay: `${index * 80}ms` } : undefined}
    >
      {projectImg ? (
        <div
          className={`project-img loading relative w-full mb-4 border-none rounded-[16px] bg-[var(--background)] overflow-hidden aspect-video aspect-[16/9] flex items-center justify-center${onImageClick ? ' cursor-pointer' : ''}`}
          onClick={onImageClick ? () => onImageClick(projectImg) : undefined}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          role={onImageClick ? 'button' : undefined}
          tabIndex={onImageClick ? 0 : undefined}
          onKeyDown={
            onImageClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onImageClick(projectImg);
                  }
                }
              : undefined
          }
          aria-label={
            onImageClick
              ? `${PROJECT_CARD_LABELS.viewFullImagePrefix} ${project.name}`
              : undefined
          }
        >
          <img
            ref={imgRef}
            src={projectImg}
            alt={project.name}
            loading="lazy"
            width={1200}
            height={675}
            className="project-card-img w-full h-full opacity-0 transition-[transform_0.6s_cubic-bezier(0.4,0,0.2,1),opacity_0.5s_ease] object-cover object-top aspect-video aspect-[16/9]"
            onLoad={(event) => {
              const img = event.currentTarget;
              img.classList.add('loaded');
              img.parentElement?.classList.remove('loading');
            }}
            onError={(event) => {
              const img = event.currentTarget;
              if (fallbackImg && !useFallback) {
                setUseFallback(true);
                return;
              }
              img.style.display = 'none';
              img.parentElement?.classList.remove('loading');
              img.parentElement?.classList.add('no-image');
            }}
          />
          {!useFallback && projectImages.length > 1 ? (
            <div
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {projectImages.map((src, imgIdx) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`View ${project.name} screenshot ${imgIdx + 1}`}
                  onClick={() => setActiveIndex(imgIdx)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    imgIdx === activeIndex ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          ) : null}
          <div className="img-fallback absolute inset-0 -z-[1] flex items-center justify-center w-full h-full bg-[var(--background)] text-[var(--text-secondary)] text-[2rem] aspect-video aspect-[16/9]" />
        </div>
      ) : null}
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
          {project.repository && isSafeExternalUrl(project.repository) ? (
            <a href={project.repository} target="_blank" rel="noreferrer noopener" className="project-link flex items-center gap-[6px] text-[var(--primary)] text-[0.82rem] font-semibold transition-opacity duration-200 hover:opacity-70">
              <i className="fa-brands fa-github" /> {PROJECT_CARD_LABELS.sourceCode}
            </a>
          ) : null}
          {project.live_preview && isSafeExternalUrl(project.live_preview) ? (
            <a
              href={project.live_preview}
              target="_blank"
              rel="noreferrer noopener"
              className="project-link demo-link flex items-center gap-[6px] text-[var(--primary)] text-[0.82rem] font-semibold transition-opacity duration-200 hover:opacity-70"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" /> {PROJECT_CARD_LABELS.livePreview}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
