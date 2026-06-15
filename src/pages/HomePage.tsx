import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildServiceInquiryTemplate,
  type ServiceInquiryTemplate,
} from '@/config/serviceInquiryTemplates';
import ErrorMessage from '@/components/common/ErrorMessage';
import CustomScrollbar from '@/components/layout/CustomScrollbar';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Experience from '@/components/sections/Experience';
import Hero from '@/components/sections/Hero';
import Portfolio from '@/components/sections/Portfolio';
import Services from '@/components/sections/Services';
import Skills from '@/components/sections/Skills';
import Testimonials from '@/components/sections/Testimonials';
import ImageModal from '@/components/effects/ImageModal';
import ParticleCanvas from '@/components/effects/ParticleCanvas';
import { useParticlesSystem } from '@/hooks/animation/useParticles';
import {
  hideAllSections,
  useRevealAnimations,
  useSectionObserver,
} from '@/hooks/animation/useRevealAnimations';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { useCustomScrollbar } from '@/hooks/scroll/useCustomScrollbar';
import { useInitialHash } from '@/hooks/scroll/useInitialHash';
import { useScrollSpy } from '@/hooks/scroll/useScrollSpy';
import { useSmoothNavScroll } from '@/hooks/scroll/useSmoothNavScroll';
import { useImageModal } from '@/hooks/ui/useImageModal';
import { useRippleEffect } from '@/hooks/ui/useRippleEffect';
import { useTheme } from '@/hooks/ui/useTheme';
import { resolveImageUrl } from '@/utils/images';
import { resolveAssetPath } from '@/utils/logo';
import { getSiteSection } from '@/utils/siteSections';
import type { Service } from '@/types';

export default function HomePage() {
  const { data, error, loading, retry } = useSiteData();
  const [serviceInquiry, setServiceInquiry] = useState<ServiceInquiryTemplate | null>(null);
  const sectionsHiddenRef = useRef(false);
  const reinitParticlesRef = useRef<(() => void) | null>(null);
  const interactionsReady = Boolean(data);

  const handleParticlesInit = useCallback((reinit: () => void) => {
    reinitParticlesRef.current = reinit;
  }, []);

  const handleThemeChange = useCallback(() => {
    reinitParticlesRef.current?.();
  }, []);

  const handleDiscussProject = useCallback((service: Service) => {
    setServiceInquiry(buildServiceInquiryTemplate(service));
  }, []);

  const { theme, toggleTheme } = useTheme(handleThemeChange);
  const { isOpen, imageSrc, variant, openModal, closeModal, clearModal } = useImageModal();

  useDocumentTitle(data?.site.title ?? 'Portfolio');

  useEffect(() => {
    if (!loading && data && !sectionsHiddenRef.current) {
      hideAllSections();
      sectionsHiddenRef.current = true;
    }
  }, [loading, data]);

  useCustomScrollbar();
  useRippleEffect();
  useParticlesSystem(interactionsReady, handleParticlesInit);

  useScrollSpy(interactionsReady);
  useSmoothNavScroll(interactionsReady);
  useRevealAnimations(interactionsReady);
  useSectionObserver(interactionsReady);
  useInitialHash(interactionsReady);

  useEffect(() => {
    if (!data?.site.favicon) return;
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (favicon) {
      favicon.href = resolveAssetPath(data.site.favicon);
    }
  }, [data?.site.favicon]);

  if (error && !data) {
    return (
      <ErrorMessage
        title="Failed to load content"
        message={error}
        onRetry={retry}
        fullscreen
      />
    );
  }

  if (!data) {
    return null;
  }

  const profileImageUrl = resolveImageUrl(data.profile.profileImage);
  const aboutImageUrl = resolveImageUrl(data.about.image);

  return (
    <>
      <ParticleCanvas />
      <CustomScrollbar />
      <Header
        scrollEnabled={interactionsReady}
        logoText={data.site.logo.text}
        logoSpan={data.site.logo.span}
        favicon={data.site.favicon}
        nav={data.site.nav}
      />
      <div className="scroll-container" id="scroll-container">
        <Hero
          profile={data.profile}
          profileImageUrl={profileImageUrl}
          onProfileClick={() => openModal(profileImageUrl, 'round')}
        />
        <About
          section={getSiteSection(data.site.sections, 'about')}
          about={data.about}
          aboutImage={aboutImageUrl}
          profileName={data.profile.name}
          onImageClick={() => openModal(aboutImageUrl, 'square')}
        />
        <Skills section={getSiteSection(data.site.sections, 'skills')} skills={data.skills} />
        <Experience experience={data.experience} />
        <Services
          section={getSiteSection(data.site.sections, 'services')}
          services={data.services}
          onDiscussProject={handleDiscussProject}
        />
        <Portfolio section={getSiteSection(data.site.sections, 'portfolio')} projects={data.projects} />
        <Testimonials testimonials={data.testimonials} />
        <Contact
          section={getSiteSection(data.site.sections, 'contact')}
          contact={data.contact}
          inquiryTemplate={serviceInquiry}
        />
        <Footer
          footerText={data.site.footer}
          logoText={data.site.logo.text}
          logoSpan={data.site.logo.span}
          profile={data.profile}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
      {imageSrc ? (
        <ImageModal
          imageSrc={imageSrc}
          variant={variant}
          isOpen={isOpen}
          onClose={closeModal}
          onClosed={clearModal}
        />
      ) : null}
    </>
  );
}
