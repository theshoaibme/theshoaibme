import { useEffect } from 'react';

export function useMobileMenu() {
  useEffect(() => {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navbar = document.querySelector('.navbar');

    if (!mobileToggle || !navbar) return;

    const handleToggle = () => {
      navbar.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      icon?.classList.toggle('fa-bars');
      icon?.classList.toggle('fa-xmark');
    };

    const navLinks = document.querySelectorAll('.navbar a');
    const closeMenu = () => {
      navbar.classList.remove('active');
      const icon = mobileToggle.querySelector('i');
      icon?.classList.add('fa-bars');
      icon?.classList.remove('fa-xmark');
    };

    mobileToggle.addEventListener('click', handleToggle);
    navLinks.forEach((link) => link.addEventListener('click', closeMenu));

    return () => {
      mobileToggle.removeEventListener('click', handleToggle);
      navLinks.forEach((link) => link.removeEventListener('click', closeMenu));
    };
  }, []);
}
