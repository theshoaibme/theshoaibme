import type { Testimonial } from '@/types';
import {
  ScrollVelocityContainer,
  ScrollVelocityColumn,
} from '@/components/effects/ScrollVelocity';
import { resolveImageUrl } from '@/utils/images';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-content">
        <i className="fa-solid fa-quote-left" />
        <p>&quot;{testimonial.feedback}&quot;</p>
      </div>
      <div className="testimonial-author">
        <img
          src={resolveImageUrl(testimonial.avatar)}
          alt={testimonial.name}
          className="author-img"
          loading="lazy"
        />
        <div className="author-info">
          <h4>{testimonial.name}</h4>
          <p>{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
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
          <span className="section-subtitle">Client Feedback</span>
          <h2 className="section-title">Testimonials</h2>
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
