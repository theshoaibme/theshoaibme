import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SEO_ENTITY } from '@/config/seo';

export const runtime = 'nodejs';
export const alt =
  'MD Shoaib Khan — Full Stack Software Engineer | Spring Boot, Next.js, React & AI Systems';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const portraitBuffer = await readFile(join(process.cwd(), 'public/images/md-shoaib-khan.jpg'));
  const portraitSrc = `data:image/jpeg;base64,${portraitBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '56px 64px',
          background:
            'linear-gradient(135deg, #090d16 0%, #0f172a 55%, #0b2948 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '700px',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: 22,
                fontWeight: 600,
                color: '#60a5fa',
                letterSpacing: '0.04em',
              }}
            >
              <span>theshoaib.me</span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8' }}>@theshoaibme</span>
            </div>

            <div
              style={{
                fontSize: 60,
                fontWeight: 800,
                lineHeight: 1.08,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              {SEO_ENTITY.name}
            </div>

            <div
              style={{
                fontSize: 27,
                fontWeight: 600,
                lineHeight: 1.35,
                color: '#93c5fd',
              }}
            >
              Full Stack Software Engineer & AI Systems Architect
            </div>

            <div
              style={{
                fontSize: 20,
                lineHeight: 1.5,
                color: '#cbd5e1',
                marginTop: '6px',
              }}
            >
              Frontend (React, Next.js, TypeScript) • Backend (Spring Boot, FastAPI, Node.js, Laravel, Rust) • Autonomous AI Agents • Flutter & AWS Cloud
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {['Spring Boot', 'Next.js', 'React', 'TypeScript', 'FastAPI', 'AI / MCP', 'AWS'].map(
              (tag) => (
                <div
                  key={tag}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    background: 'rgba(59, 130, 246, 0.16)',
                    border: '1px solid rgba(96, 165, 250, 0.35)',
                    color: '#e2e8f0',
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </div>
              ),
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '340px',
            height: '440px',
            borderRadius: '28px',
            overflow: 'hidden',
            border: '3px solid rgba(96, 165, 250, 0.5)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
          }}
        >
          <img
            src={portraitSrc}
            alt={SEO_ENTITY.name}
            width={340}
            height={440}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
