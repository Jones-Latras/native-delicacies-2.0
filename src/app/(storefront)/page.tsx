import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-200">
            Authentic Filipino Heritage
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Native Delicacies
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-amber-100">
            Handcrafted kakanin and regional specialties made with love, tradition, and the finest
            local ingredients. Taste the heritage of the Philippines.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/menu">
              <Button size="lg" className="bg-white text-amber-800 hover:bg-amber-50">
                Browse Menu
              </Button>
            </Link>
            <Link href="/bilao-builder">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Build Your Bilao
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section Placeholder */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            Popular Delicacies
          </h2>
          <p className="mt-2 text-stone-500">
            Our most loved traditional treats, freshly prepared for you.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200" />
              <div className="p-4">
                <div className="h-5 w-3/4 rounded bg-stone-200" />
                <div className="mt-2 h-4 w-full rounded bg-stone-100" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-6 w-16 rounded bg-stone-200" />
                  <div className="h-9 w-24 rounded-lg bg-amber-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Heritage Story Section */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            A Taste of Filipino Heritage
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-stone-500">
            Every delicacy we create carries generations of Filipino culinary wisdom. From the
            sticky-sweet bibingka of Luzon to the rich flavors of Visayan treats, we preserve and
            share the authentic tastes that make our culture so rich.
          </p>
        </div>
      </section>

      {/* Gift / Pasalubong CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 to-amber-800 p-8 text-white sm:p-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Pasalubong & Gift Bundles</h2>
            <p className="mx-auto mt-3 max-w-xl text-amber-100">
              Send the gift of tradition. Our curated gift bundles are perfect for sharing with
              loved ones near and far.
            </p>
            <Link href="/menu?filter=bundles" className="mt-6 inline-block">
              <Button size="lg" className="bg-white text-amber-800 hover:bg-amber-50">
                View Gift Bundles
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
