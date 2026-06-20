import ServicesSnakeMarquee from '@/components/sections/ServicesSnakeMarquee';
import type { Service, SiteSection } from '@/types';

interface ServicesProps {
  section: SiteSection;
  services: Service[];
  onDiscussProject?: (service: Service) => void;
}

export default function Services({ section, services, onDiscussProject }: ServicesProps) {
  return (
    <section id="services" className="section services">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-subtitle" id="services-subtitle">
            {section.subtitle}
          </span>
          <h2 className="section-title" id="services-title">
            {section.title}
          </h2>
        </div>
        <div className="services-grid" id="services-grid">
          {services.map((service, index) => (
            <article
              key={service.title}
              className="service-card reveal"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="service-card-header">
                <div className={`service-icon service-icon-${index % 4}`}>
                  <i className={service.icon} aria-hidden="true" />
                </div>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a
                href="#contact"
                className="service-cta"
                data-tooltip="Contact me about this service"
                aria-label={`Contact me about ${service.title}`}
                onClick={() => onDiscussProject?.(service)}
              >
                <span className="btn-shine-text">Discuss your project</span>
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </div>
      <div className="container">
        <ServicesSnakeMarquee />
      </div>
    </section>
  );
}
