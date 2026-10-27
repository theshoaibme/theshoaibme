import type { SiteSection, Testimonial } from '@/types';
import {
  ScrollVelocityContainer,
  ScrollVelocityColumn,
} from '@/components/effects/ScrollVelocity';
import { resolveImageUrl } from '@/utils/images';

interface TestimonialsProps {
  section: SiteSection;
  testimonials: Testimonial[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-content">
        <i className="fa-solid fa-quote-left" />
        <p>&quot;{testimonial.feedback}&quot;</p>
      </div>
      <div className="testimonial-author">
        {testimonial.avatar ? (
          <img
            src={resolveImageUrl(testimonial.avatar)}
            alt={testimonial.name}
            className="author-img"
            loading="lazy"
            width={40}
            height={40}
          />
        ) : (
          <div className="author-img author-initials" aria-hidden="true">
            {getInitials(testimonial.name)}
          </div>
        )}
        <div className="author-info">
          <h3>{testimonial.name}</h3>
          <p>{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials({ section, testimonials }: TestimonialsProps) {
  const colCount = 4;
  const rawColumns: Testimonial[][] = Array.from({ length: colCount }, () => []);

  testimonials.forEach((item, index) => {
    rawColumns[index % colCount].push(item);
  });

  // Ensure each column has sufficient items to loop seamlessly
  const columns = rawColumns.map((col) => {
    if (col.length === 0) return testimonials.slice(0, 4);
    let extended = [...col];
    while (extended.length < 4) {
      extended = [...extended, ...col];
    }
    return extended;
  });

  return (
    <section id="testimonials" className="section testimonials">
      <div className="container">
        <div className="section-header reveal">
          <h2 className="section-title">{section.title}</h2>
        </div>
        <ScrollVelocityContainer className="testimonials-grid-container">
          {/* Column 1: UP */}
          <ScrollVelocityColumn
            className="testimonials-col testimonials-col-1"
            direction={1}
            baseVelocity={4}
          >
            {columns[0].map((testimonial, idx) => (
              <TestimonialCard
                key={`${testimonial.name}-col0-${idx}`}
                testimonial={testimonial}
              />
            ))}
          </ScrollVelocityColumn>

          {/* Column 2: DOWN */}
          <ScrollVelocityColumn
            className="testimonials-col testimonials-col-2"
            direction={-1}
            baseVelocity={4}
          >
            {columns[1].map((testimonial, idx) => (
              <TestimonialCard
                key={`${testimonial.name}-col1-${idx}`}
                testimonial={testimonial}
              />
            ))}
          </ScrollVelocityColumn>

          {/* Column 3: UP */}
          <ScrollVelocityColumn
            className="testimonials-col testimonials-col-3"
            direction={1}
            baseVelocity={4}
          >
            {columns[2].map((testimonial, idx) => (
              <TestimonialCard
                key={`${testimonial.name}-col2-${idx}`}
                testimonial={testimonial}
              />
            ))}
          </ScrollVelocityColumn>

          {/* Column 4: DOWN */}
          <ScrollVelocityColumn
            className="testimonials-col testimonials-col-4"
            direction={-1}
            baseVelocity={4}
          >
            {columns[3].map((testimonial, idx) => (
              <TestimonialCard
                key={`${testimonial.name}-col3-${idx}`}
                testimonial={testimonial}
              />
            ))}
          </ScrollVelocityColumn>
        </ScrollVelocityContainer>
      </div>
    </section>
  );
}
