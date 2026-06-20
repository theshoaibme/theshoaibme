const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export async function downloadResumePdf(
  article: HTMLElement,
  filename: string,
): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;

  window.scrollTo(0, 0);
  await document.fonts.ready;

  await html2pdf()
    .set({
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        logging: false,
        width: A4_WIDTH_PX,
        windowWidth: A4_WIDTH_PX,
      },
      jsPDF: {
        unit: 'px',
        format: [A4_WIDTH_PX, A4_HEIGHT_PX],
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.cv-pdf-page--2',
      },
    } as Record<string, unknown>)
    .from(article)
    .save();
}
