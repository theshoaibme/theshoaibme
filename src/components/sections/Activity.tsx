import { useEffect, useState } from 'react';
import ContributionSkyline, { type ContributionDay } from '@/components/effects/ContributionSkyline';
import { ACTIVITY_CONFIG } from '@/data/activityConfig';
import type { Profile, SiteSection } from '@/types';

interface ActivityProps {
  section?: SiteSection;
  profile?: Profile;
  username?: string;
}

export default function Activity({ section, profile, username }: ActivityProps) {
  const [data, setData] = useState<ContributionDay[] | undefined>(undefined);

  // Extract GitHub username dynamically from profile social links if not explicitly passed
  const githubLink = profile?.social?.find((link) => link.url.includes('github.com'));
  const extractedUsername = githubLink
    ? githubLink.url.replace(/\/+$/, '').split('github.com/')[1]?.split('/')[0]
    : undefined;
  const targetUsername = username || extractedUsername || ACTIVITY_CONFIG.defaultUsername;

  useEffect(() => {
    if (!targetUsername) return;
    const controller = new AbortController();

    fetch(`${ACTIVITY_CONFIG.contributionsApiBaseUrl}/${targetUsername}?y=last`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch contributions');
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json?.contributions)) {
          const validDays: ContributionDay[] = json.contributions.map(
            (c: { date: string; count: number }) => ({
              date: c.date,
              count: Number(c.count) || 0,
            }),
          );
          setData(validDays);
        }
      })
      .catch(() => {
        // Fall back gracefully to seeded believable generation in ContributionSkyline
      });

    return () => controller.abort();
  }, [targetUsername]);

  return (
    <section
      id="activity"
      className="section activity !min-h-0 !pt-0 pb-12"
      style={{ minHeight: 'auto', paddingTop: 0 }}
      aria-label={section?.title ?? 'Activity Skyline'}
    >
      <div className="container flex flex-col items-center justify-center">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center">
          <ContributionSkyline
            data={data}
            className="w-full"
            title={null}
            showToggle={false}
            palette="mono"
            scrollDriven={true}
          />
        </div>
      </div>
    </section>
  );
}
