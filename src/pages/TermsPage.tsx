import PolicyPageLayout from '@/components/layout/PolicyPageLayout';

export default function TermsPage() {
  return (
    <PolicyPageLayout policyKey="terms" defaultTitle="Terms of Service">
      <h2>1. Agreement to Terms</h2>
      <p>
        By accessing or using this website, you agree to be bound by these Terms of Service and all
        applicable laws and regulations.
      </p>

      <h2>2. Intellectual Property</h2>
      <p>
        The content, original features, and functionality of this portfolio are and will remain the
        exclusive property of MD Shoaib Khan.
      </p>

      <h2>3. Limitation of Liability</h2>
      <p>
        In no event shall MD Shoaib Khan be liable for any indirect, incidental, special,
        consequential or punitive damages resulting from your use of the site.
      </p>

      <h2>4. Changes to Terms</h2>
      <p>
        I reserve the right to modify or replace these terms at any time. Your continued use of the
        site after changes constitutes acceptance of the new terms.
      </p>
    </PolicyPageLayout>
  );
}
