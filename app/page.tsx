import { VideoHero } from '@/components/LandingPage';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Video Background */}
      <VideoHero />
      
      {/* More sections will be added here */}
      <section className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-zinc-900">
            More sections coming soon...
          </h2>
          <p className="mt-4 text-zinc-600">
            Impact stats, highlights, and food listings
          </p>
        </div>
      </section>
    </main>
  );
}
