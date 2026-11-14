import PolicyPageLayout from '@/components/layout/PolicyPageLayout';

export default function PrivacyPage() {
  return (
    <PolicyPageLayout policyKey="privacy" defaultTitle="Privacy Policy">
      <h2>1. Information Collection</h2>
      <p>
        I collect information that you voluntarily provide through the contact form, such as your
        name, email address, subject, and message content.
      </p>

      <h2>2. Use of Information</h2>
      <p>
        Information submitted through the contact form is used solely to respond to your inquiries.
        Messages may be processed through secure third-party services (Cloudflare Turnstile for bot
        protection, EmailJS for email delivery, and Telegram for notifications) strictly for
        delivering and managing contact requests. When you download my resume, a lightweight server
        event may be recorded (download count, timestamp, and a hashed network identifier) after
        Cloudflare Turnstile verification so I can be notified via Telegram. This does not include
        your name or email unless you contact me separately.
      </p>

      <h2>3. Cookies</h2>
      <p>
        This website uses a functional theme preference cookie (`theme`) to remember your light or
        dark mode selection. It does not use advertising, analytics, or cross-site tracking cookies.
      </p>

      <h2>4. Security</h2>
      <p>
        I implement reasonable security measures to protect your personal information, including
        bot protection, transport encryption (HTTPS), and server-side validation. No method of
        transmission over the internet is 100% secure.
      </p>
    </PolicyPageLayout>
  );
}
