import { Link } from 'react-router-dom';
import type { Project, SiteSection } from '@/types';
import ProjectCard from '@/components/sections/ProjectCard';
import { getFeaturedProjects, hasMoreProjects } from '@/utils/projects';

interface PortfolioProps {
  section: SiteSection;
  projects: Project[];
}

export default function Portfolio({ section, projects }: PortfolioProps) {
  const featuredProjects = getFeaturedProjects(projects);
  const showViewAll = hasMoreProjects(projects);

  return (
    <section id="portfolio" className="section portfolio">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-subtitle" id="portfolio-subtitle">
            {section.subtitle}
          </span>
          <h2 className="section-title" id="portfolio-title">
            {section.title}
          </h2>
        </div>
        <div className="portfolio-grid" id="portfolio-grid">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.name} project={project} index={index} />
          ))}
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
