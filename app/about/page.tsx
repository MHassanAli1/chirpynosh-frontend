import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about ChirpyNosh — our mission to reduce food waste and feed communities.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About ChirpyNosh</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            ChirpyNosh is a food rescue platform that connects food suppliers with individuals and
            organizations in need. We believe no edible food should go to waste while communities go
            hungry. Our platform makes it easy for restaurants, grocery stores, and food producers
            to list surplus or near-expiry food at subsidized prices, enabling NGOs and individuals
            to claim and pick up these items before they&apos;re wasted.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="font-semibold text-lg mb-2">Suppliers List</h3>
              <p className="text-gray-600">Food businesses post surplus inventory at reduced prices.</p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-semibold text-lg mb-2">Recipients Claim</h3>
              <p className="text-gray-600">NGOs and individuals browse and claim available food.</p>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-xl">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-semibold text-lg mb-2">Pickup &amp; Verify</h3>
              <p className="text-gray-600">Secure OTP verification ensures smooth handover.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Our Values</h2>
          <ul className="space-y-4 text-gray-600 text-lg">
            <li className="flex gap-3"><span className="text-emerald-600 font-bold">•</span> Zero waste — every meal matters</li>
            <li className="flex gap-3"><span className="text-emerald-600 font-bold">•</span> Community first — feeding those who need it most</li>
            <li className="flex gap-3"><span className="text-emerald-600 font-bold">•</span> Transparency — verified suppliers and secure transactions</li>
            <li className="flex gap-3"><span className="text-emerald-600 font-bold">•</span> Sustainability — reducing environmental impact through food rescue</li>
          </ul>
        </section>

        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Ready to make a difference?</p>
          <Link href="/signup" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            Join ChirpyNosh
          </Link>
        </div>
      </div>
    </div>
  );
}
