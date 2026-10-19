import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project, SiteSection } from '@/types';
import ProjectCard from '@/components/sections/ProjectCard';
import { getFeaturedProjects, hasMoreProjects } from '@/utils/projects';

interface PortfolioProps {
  section: SiteSection;
  projects: Project[];
  onImageClick?: (imageUrl: string) => void;
}

export default function Portfolio({ section, projects, onImageClick }: PortfolioProps) {
  const featuredProjects = getFeaturedProjects(projects);
  const showViewAll = hasMoreProjects(projects);

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(featuredProjects.length > 1);
  const [isDragging, setIsDragging] = useState(false);

  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const scrollLeft = track.scrollLeft;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);

    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft < maxScroll - 10);

    const slides = track.querySelectorAll<HTMLElement>('.portfolio-carousel-slide');
    if (slides.length === 0) return;

    let closestIndex = 0;
    let minDiff = Infinity;
    slides.forEach((slide, idx) => {
      const diff = Math.abs(slide.offsetLeft - track.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();
    track.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      track.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollToSlide = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const slides = track.querySelectorAll<HTMLElement>('.portfolio-carousel-slide');
    if (!slides[index]) return;

    const targetLeft = slides[index].offsetLeft - track.offsetLeft;
    track.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const scrollPrev = () => {
    const track = trackRef.current;
    if (!track) return;

    const slides = track.querySelectorAll<HTMLElement>('.portfolio-carousel-slide');
    if (slides.length === 0) return;

    const currentScroll = track.scrollLeft;
    let prevSlideIndex = -1;
    for (let i = slides.length - 1; i >= 0; i--) {
      if (slides[i].offsetLeft - track.offsetLeft < currentScroll - 20) {
        prevSlideIndex = i;
        break;
      }
    }

    if (prevSlideIndex !== -1) {
      scrollToSlide(prevSlideIndex);
    } else {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    const track = trackRef.current;
    if (!track) return;

    const slides = track.querySelectorAll<HTMLElement>('.portfolio-carousel-slide');
    if (slides.length === 0) return;

    const currentScroll = track.scrollLeft;
    const nextSlideIndex = Array.from(slides).findIndex(
      (slide) => slide.offsetLeft - track.offsetLeft > currentScroll + 20,
    );

    if (nextSlideIndex !== -1) {
      scrollToSlide(nextSlideIndex);
    } else {
      track.scrollTo({ left: track.scrollWidth - track.clientWidth, behavior: 'smooth' });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = track.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const track = trackRef.current;
    if (!track) return;

    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 4) {
      hasMovedRef.current = true;
      if (!isDragging) {
        setIsDragging(true);
      }
      track.scrollLeft = startScrollLeftRef.current - deltaX;
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 0);
    }
  };

  return (
    <section id="portfolio" className="section portfolio">
      <div className="container">
        <div className="section-header reveal">
          <h2 className="section-title" id="portfolio-title">
            {section.title}
          </h2>
        </div>

        <div className="portfolio-carousel reveal">
          <div
            id="portfolio-grid"
            ref={trackRef}
            className={`portfolio-carousel-track${isDragging ? ' is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClickCapture={handleClickCapture}
            role="region"
            aria-label="Featured projects carousel"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollPrev();
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollNext();
              }
            }}
          >
            {featuredProjects.map((project, index) => (
              <div
                key={project.name}
                className="portfolio-carousel-slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${featuredProjects.length}`}
              >
                <ProjectCard
                  project={project}
                  index={index}
                  animate={false}
                  onImageClick={onImageClick}
                />
              </div>
            ))}
          </div>

          <div className="portfolio-carousel-controls">
            <button
              type="button"
              className="carousel-nav-btn carousel-prev-btn"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous project"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>

            <div className="carousel-dots" role="tablist" aria-label="Project slides">
              {featuredProjects.map((project, idx) => (
                <button
                  key={project.name}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === idx}
                  aria-label={`Go to slide ${idx + 1}: ${project.name}`}
                  className={`carousel-dot${activeIndex === idx ? ' active' : ''}`}
                  onClick={() => scrollToSlide(idx)}
                />
              ))}
            </div>

            <button
              type="button"
              className="carousel-nav-btn carousel-next-btn"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next project"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        </div>

        {showViewAll ? (
          <div className="portfolio-actions reveal">
            <Link to="/projects" className="btn btn-outline view-all-projects">
              View All Projects
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
