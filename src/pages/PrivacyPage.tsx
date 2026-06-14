import PolicyPageLayout from '@/components/layout/PolicyPageLayout';

export default function PrivacyPage() {
  return (
    <PolicyPageLayout policyKey="privacy" defaultTitle="Privacy Policy">
      <h2>1. Information Collection</h2>
      <p>
        I only collect information that you voluntarily provide through the contact form, such as
        your name and email address.
      </p>

      <h2>2. Use of Information</h2>
      <p>
        Any information collected is used solely to respond to your inquiries and will never be
        shared with third parties.
      </p>

      <h2>3. Cookies</h2>
      <p>This website does not use tracking cookies or analytics that collect personal data.</p>

      <h2>4. Security</h2>
      <p>
        I implement reasonable security measures to protect your personal information, but no method
        of transmission over the internet is 100% secure.
      </p>
    </PolicyPageLayout>
  );
}
