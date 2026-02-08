import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ChirpyNosh privacy policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: February 8, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information you provide directly, including your name, email address, phone number,
              and organization details when you register. For food suppliers, we also collect KYC verification
              documents. We automatically collect usage data such as IP address, browser type, and pages visited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>To operate and maintain the ChirpyNosh platform</li>
              <li>To verify supplier identities through KYC processes</li>
              <li>To facilitate food claims and pickup coordination</li>
              <li>To send transactional emails (OTP codes, claim confirmations)</li>
              <li>To improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell your personal data. We share limited information only as necessary:
              supplier organization names are visible on listings, and contact details are shared
              between parties only after a claim is confirmed for pickup coordination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures including encrypted data transmission (TLS),
              hashed passwords, secure cookie-based authentication, and rate-limited API endpoints to protect
              your data from unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies for authentication and session management. We do not use
              third-party tracking cookies. You can configure your browser to reject cookies, but this
              may limit your ability to use certain features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time
              through your profile settings. For data deletion requests, contact us at{' '}
              <a href="mailto:privacy@chirpynosh.com" className="text-emerald-600 hover:text-emerald-700">
                privacy@chirpynosh.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about this privacy policy, contact us at{' '}
              <a href="mailto:privacy@chirpynosh.com" className="text-emerald-600 hover:text-emerald-700">
                privacy@chirpynosh.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
