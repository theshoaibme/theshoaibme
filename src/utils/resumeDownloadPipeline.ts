import { downloadResumePdf } from '@/utils/downloadResumePdf';
import { notifyResumeDownloadAsync } from '@/utils/resumeDownloadApi';

export interface ResumeDownloadPipelineOptions {
  article: HTMLElement;
  filename?: string;
  source?: string;
  turnstileToken?: string;
  honey_pot?: string;
}

export async function runResumeDownloadPipeline({
  article,
  filename = 'MD_Shoaib_Khan_Resume.pdf',
  source = 'resume-page',
  turnstileToken,
  honey_pot,
}: ResumeDownloadPipelineOptions): Promise<void> {
  await downloadResumePdf(article, filename);

  notifyResumeDownloadAsync({
    source,
    referrer: document.referrer || undefined,
    turnstileToken,
    honey_pot,
  });
}
