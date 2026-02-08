import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Impact',
  description: 'See the impact ChirpyNosh is making — reducing food waste and feeding communities.',
};

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h1>
        <p className="text-lg text-gray-600 mb-12">
          Together, we&apos;re building a world where good food reaches those who need it.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-emerald-50 rounded-2xl">
            <div className="text-5xl font-bold text-emerald-600 mb-2">0+</div>
            <p className="text-gray-700 font-medium">Meals Rescued</p>
          </div>
          <div className="text-center p-8 bg-orange-50 rounded-2xl">
            <div className="text-5xl font-bold text-orange-600 mb-2">0+</div>
            <p className="text-gray-700 font-medium">Active Suppliers</p>
          </div>
          <div className="text-center p-8 bg-yellow-50 rounded-2xl">
            <div className="text-5xl font-bold text-yellow-600 mb-2">0+</div>
            <p className="text-gray-700 font-medium">Communities Served</p>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Environmental Impact</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Food waste accounts for roughly 8-10% of global greenhouse gas emissions. By rescuing
            surplus food and redirecting it to those in need, ChirpyNosh helps reduce carbon
            emissions, conserve water, and minimize landfill waste — one meal at a time.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Social Impact</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Millions of people face food insecurity while perfectly good food goes to waste.
            ChirpyNosh bridges this gap by providing an accessible platform for food redistribution,
            empowering NGOs and individuals to access affordable nutrition.
          </p>
        </section>

        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <p className="text-gray-500 italic text-lg">
            Impact statistics will be updated in real-time as our platform grows. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
