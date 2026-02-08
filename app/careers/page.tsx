import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the ChirpyNosh team and help us fight food waste.',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Careers at ChirpyNosh</h1>
        <p className="text-lg text-gray-600 mb-12">
          Join our mission to eliminate food waste and feed communities. We&apos;re building something meaningful.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Why Work With Us?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">🌱 Purpose-Driven</h3>
              <p className="text-gray-600">Your work directly impacts food security and sustainability.</p>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">🚀 Growth</h3>
              <p className="text-gray-600">Early-stage startup with massive growth potential.</p>
            </div>
            <div className="p-6 bg-yellow-50 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">🌍 Remote-First</h3>
              <p className="text-gray-600">Work from anywhere — we value results over hours.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">🤝 Great Team</h3>
              <p className="text-gray-600">Collaborative, inclusive, and passionate people.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-6">Open Positions</h2>
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">No open positions at the moment.</p>
            <p className="text-gray-400">
              Interested in future opportunities? Reach out at{' '}
              <a href="mailto:careers@chirpynosh.com" className="text-emerald-600 hover:text-emerald-700">
                careers@chirpynosh.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
