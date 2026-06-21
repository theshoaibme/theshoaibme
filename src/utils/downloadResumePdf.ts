const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

function getArticlePadding(article: HTMLElement): string {
  const styles = window.getComputedStyle(article);
  return `${styles.paddingTop} ${styles.paddingRight} ${styles.paddingBottom} ${styles.paddingLeft}`;
}

function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

function removeExportFrame(frame: HTMLDivElement): void {
  frame.replaceChildren();
  frame.remove();
}

export async function downloadResumePdf(
  article: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const pages = Array.from(article.querySelectorAll<HTMLElement>('.cv-pdf-page'));

  if (pages.length !== 2) {
    throw new Error('Resume must contain exactly 2 pages.');
  }

  window.scrollTo(0, 0);
  await document.fonts.ready;

  const padding = getArticlePadding(article);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [A4_WIDTH_PX, A4_HEIGHT_PX],
    compress: true,
  });

  for (let index = 0; index < pages.length; index += 1) {
    const frame = document.createElement('div');
    frame.className = 'cv-document cv-pdf-document cv-pdf-export-frame';
    frame.style.width = `${A4_WIDTH_PX}px`;
    frame.style.height = `${A4_HEIGHT_PX}px`;
    frame.style.padding = padding;
    frame.style.background = '#ffffff';
    frame.style.color = '#111111';
    frame.style.setProperty('--cv-paper-bg', '#ffffff');
    frame.style.setProperty('--cv-paper-text', '#111111');
    frame.style.setProperty('--cv-blue', '#1b4f83');

    const pageClone = pages[index].cloneNode(true) as HTMLElement;
    frame.appendChild(pageClone);
    document.body.appendChild(frame);

    try {
      const canvas = await html2canvas(frame, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
        logging: false,
      });

      const image = canvas.toDataURL('image/jpeg', 0.94);
      releaseCanvas(canvas);

      if (index > 0) {
        pdf.addPage([A4_WIDTH_PX, A4_HEIGHT_PX], 'portrait');
      }

      pdf.addImage(image, 'JPEG', 0, 0, A4_WIDTH_PX, A4_HEIGHT_PX, undefined, 'FAST');
    } finally {
      removeExportFrame(frame);
    }
  }

  pdf.save(filename);
}
