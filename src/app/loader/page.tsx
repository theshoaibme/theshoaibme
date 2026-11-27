import type { Metadata } from 'next';
import LoaderPage from '@/views/LoaderPage';

export const metadata: Metadata = {
  title: 'Loader',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <LoaderPage />;
}
