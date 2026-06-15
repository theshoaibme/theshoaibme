import type { Testimonial } from '@/types';
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
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
  const middleIndex = Math.ceil(testimonials.length / 2);
  const group1 = testimonials.slice(0, middleIndex);
  const group2Source = testimonials.slice(middleIndex);
  const group2 = group2Source.length ? group2Source : group1;

  return (
    <section id="testimonials" className="section testimonials">
      <div className="sticky-inner">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-subtitle">Client Feedback</span>
            <h2 className="section-title">Testimonials</h2>
          </div>
          <ScrollVelocityContainer className="testimonials-marquee">
            <ScrollVelocityRow
              className="marquee-row marquee-row-first"
              direction={1}
              baseVelocity={3}
            >
              {group1.map((testimonial) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} />
              ))}
            </ScrollVelocityRow>
            <ScrollVelocityRow
              className="marquee-row marquee-row-second"
              direction={-1}
              baseVelocity={3}
            >
              {group2.map((testimonial) => (
                <TestimonialCard key={`${testimonial.name}-row2`} testimonial={testimonial} />
              ))}
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
        </div>
      </div>
    </section>
  );
}
