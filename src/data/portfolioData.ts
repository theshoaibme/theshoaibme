export const PORTFOLIO_LABELS = {
  viewAllProjects: 'View All Projects',
  carouselAriaLabel: 'Featured projects carousel',
  prevButtonAriaLabel: 'Previous project',
  nextButtonAriaLabel: 'Next project',
  slideAriaLabel: (current: number, total: number) => `${current} of ${total}`,
  dotAriaLabel: (index: number, name: string) => `Go to slide ${index + 1}: ${name}`,
} as const;

export const PROJECT_CARD_LABELS = {
  sourceCode: 'Source',
  livePreview: 'Live Preview Link',
  viewFullImagePrefix: 'View full image for',
} as const;
