import { motion, type Variants } from 'framer-motion';
import {
  Code2,
  Smartphone,
  Sparkles,
  Palette,
  Cloud,
  Server,
  Handshake,
  ShoppingCart,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import ServicesSnakeMarquee from '@/components/sections/ServicesSnakeMarquee';
import type { Service, SiteSection } from '@/types';

interface ServicesProps {
  section: SiteSection;
  services: Service[];
  onDiscussProject?: (service: Service) => void;
}

const SERVICE_LUCIDE_MAP: Record<string, LucideIcon> = {
  'Web Development': Code2,
  'Mobile App Development': Smartphone,
  'AI Solutions': Sparkles,
  'UI/UX Design': Palette,
  'Cloud & DevOps': Cloud,
  'API & Backend': Server,
  'Freelance Consulting': Handshake,
  'E-Commerce Solutions': ShoppingCart,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 14,
    },
  },
};

export default function Services({ section, services, onDiscussProject }: ServicesProps) {
  return (
    <section id="services" className="section services">
      <div className="container">
        <div className="section-header reveal">
          <h2 className="section-title" id="services-title">
            {section.title}
          </h2>
        </div>

        <motion.div
          className="services-grid"
          id="services-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services.map((service, index) => {
            const IconComponent = SERVICE_LUCIDE_MAP[service.title];

            return (
              <motion.article
                key={service.title}
                className="service-card group relative flex flex-col p-6 rounded-[24px] bg-[var(--muted)] border-none text-left transition-shadow duration-300 cursor-default"
                variants={itemVariants}
              >
                <div className="service-card-header mb-4 flex items-center justify-between">
                  <div
                    className={`service-icon service-icon-${index % 4} flex items-center justify-center w-12 h-12 rounded-2xl transition-transform duration-300 group-hover:scale-110`}
                  >
                    {IconComponent ? (
                      <IconComponent className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <i className={service.icon} aria-hidden="true" />
                    )}
                  </div>
                </div>

                <h3 className="mb-2 text-[var(--text-color)] font-heading text-[1.15rem] font-semibold leading-tight">
                  {service.title}
                </h3>
                <p className="mb-5 text-[var(--text-secondary)] text-[0.88rem] leading-relaxed grow">
                  {service.description}
                </p>

                <a
                  href="#contact"
                  className="service-cta mt-auto flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-[var(--background)] text-[var(--text-color)] font-semibold text-[0.85rem] transition-all duration-200 hover:text-[var(--primary)]"
                  data-tooltip="Contact me about this service"
                  aria-label={`Contact me about ${service.title}`}
                  onClick={() => onDiscussProject?.(service)}
                >
                  <span className="btn-shine-text">Discuss your project</span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      <div className="container">
        <ServicesSnakeMarquee />
      </div>
    </section>
  );
}
