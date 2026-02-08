import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ChirpyNosh terms of service — rules and guidelines for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: February 8, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using ChirpyNosh, you agree to be bound by these Terms of Service. If you
              do not agree to these terms, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              You must provide accurate information when creating an account. You are responsible for
              maintaining the security of your account credentials. Food supplier accounts require
              KYC verification before listing items.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Food Supplier Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>List only food that is safe for consumption</li>
              <li>Provide accurate descriptions, quantities, and expiry information</li>
              <li>Honor all confirmed claims and be available during pickup windows</li>
              <li>Maintain proper food storage and handling standards</li>
              <li>Complete KYC verification with valid documentation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Recipient Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Claim only quantities you can reasonably use</li>
              <li>Pick up claimed items within the designated time window</li>
              <li>Present valid OTP verification at pickup</li>
              <li>Do not resell food obtained through the platform at a markup</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Prohibited Conduct</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Misrepresenting food quality, safety, or expiry information</li>
              <li>Creating multiple accounts to circumvent claim limits</li>
              <li>Harassment or abuse of other platform users</li>
              <li>Attempting to exploit or compromise platform security</li>
              <li>Using the platform for any illegal purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Disclaimer</h2>
            <p className="text-gray-600 leading-relaxed">
              ChirpyNosh is a marketplace platform connecting food suppliers with recipients. We do not
              manufacture, store, or handle food items. While we verify supplier organizations through
              KYC, we cannot guarantee the quality or safety of individual food items. Users assume
              responsibility for inspecting items at pickup.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Account Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms, engage in
              fraudulent activity, or pose a risk to the community. Restricted accounts cannot create
              listings or claims.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these terms from time to time. Continued use of the platform after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these terms, contact us at{' '}
              <a href="mailto:legal@chirpynosh.com" className="text-emerald-600 hover:text-emerald-700">
                legal@chirpynosh.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
