import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ChirpyNosh team. We\'d love to hear from you.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 mb-12">
          Have questions, feedback, or partnership inquiries? We&apos;d love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-emerald-700 mb-6">Get In Touch</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="text-2xl">📧</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:support@chirpynosh.com" className="text-emerald-600 hover:text-emerald-700">
                    support@chirpynosh.com
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-2xl">💼</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Partnerships</h3>
                  <a href="mailto:partners@chirpynosh.com" className="text-emerald-600 hover:text-emerald-700">
                    partners@chirpynosh.com
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-2xl">🐛</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Report an Issue</h3>
                  <a href="mailto:bugs@chirpynosh.com" className="text-emerald-600 hover:text-emerald-700">
                    bugs@chirpynosh.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">How do I become a food supplier?</h3>
                <p className="text-gray-600 text-sm mt-1">Sign up, select &quot;Food Supplier&quot; role, and complete KYC verification.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Is the platform free to use?</h3>
                <p className="text-gray-600 text-sm mt-1">Yes! ChirpyNosh is free for all users — suppliers, NGOs, and individuals.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">How does pickup verification work?</h3>
                <p className="text-gray-600 text-sm mt-1">Once you claim food, you receive an OTP. Present it at pickup for verification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
