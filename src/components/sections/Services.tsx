import type { Service } from '@/types';

interface ServicesProps {
  services: Service[];
}

export default function Services({ services }: ServicesProps) {
  return (
    <section id="services" className="section services">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-subtitle">What I Do</span>
          <h2 className="section-title">My Services</h2>
        </div>
        <div className="services-grid" id="services-grid">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="service-card reveal"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="service-icon">
                <i className={service.icon} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
