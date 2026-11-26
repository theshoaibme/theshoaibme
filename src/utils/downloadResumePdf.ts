const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

function getExportMargins(article: HTMLElement): {
  marginY: number;
  marginLeft: string;
  marginRight: string;
} {
  const styles = window.getComputedStyle(article);
  const parsedTop = Number.parseFloat(styles.paddingTop);
  const marginY = Number.isFinite(parsedTop) && parsedTop > 0 ? parsedTop : 36;
  return {
    marginY,
    marginLeft: styles.paddingLeft || '46px',
    marginRight: styles.paddingRight || '46px',
  };
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

  const { marginY, marginLeft, marginRight } = getExportMargins(article);
  const maxContentHeight = A4_HEIGHT_PX - marginY * 2;
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
    frame.style.height = 'auto';
    frame.style.minHeight = `${maxContentHeight}px`;
    frame.style.padding = `0 ${marginRight} 0 ${marginLeft}`;
    frame.style.background = '#ffffff';
    frame.style.color = '#111111';
    frame.style.setProperty('--cv-paper-bg', '#ffffff');
    frame.style.setProperty('--cv-paper-text', '#111111');
    frame.style.setProperty('--cv-blue', '#1b4f83');

    const pageClone = pages[index].cloneNode(true) as HTMLElement;
    frame.appendChild(pageClone);
    document.body.appendChild(frame);

    try {
      const contentHeight = Math.max(frame.scrollHeight, maxContentHeight);
      const canvas = await html2canvas(frame, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: A4_WIDTH_PX,
        height: contentHeight,
        windowWidth: A4_WIDTH_PX,
        windowHeight: contentHeight,
        logging: false,
      });

      const image = canvas.toDataURL('image/jpeg', 0.94);
      releaseCanvas(canvas);

      const fitScale = Math.min(1, maxContentHeight / contentHeight);
      const drawWidth = A4_WIDTH_PX * fitScale;
      const drawHeight = contentHeight * fitScale;
      const drawX = (A4_WIDTH_PX - drawWidth) / 2;

      if (index > 0) {
        pdf.addPage([A4_WIDTH_PX, A4_HEIGHT_PX], 'portrait');
      }

      pdf.addImage(image, 'JPEG', drawX, marginY, drawWidth, drawHeight, undefined, 'FAST');
    } finally {
      removeExportFrame(frame);
    }
  }

  pdf.save(filename);
}
