import { Heart, Award, Leaf, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALUES = [
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Every delicacy is handcrafted using traditional methods passed down through generations, preserving the authentic taste of Filipino heritage.",
  },
  {
    icon: Award,
    title: "Quality Ingredients",
    description:
      "We source the finest local ingredients — freshly harvested coconut, premium rice flour, and natural sweeteners — for an uncompromising taste experience.",
  },
  {
    icon: Leaf,
    title: "Tradition & Heritage",
    description:
      "Our recipes are rooted in centuries-old Filipino culinary traditions. Each kakanin carries a story of regional pride and cultural identity.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We work closely with local farmers and artisans, supporting the communities that have kept these culinary traditions alive for generations.",
  },
];

export default async function AboutPage() {
  const contentPage = await prisma.contentPage.findUnique({
    where: { slug: "about" },
    select: { title: true, content: true },
  });

  if (contentPage) {
    return (
      <div className="artisan-about mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-latik/15 px-7 pb-10 sm:px-10 sm:pb-12">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-pulot">Our Story</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-kape sm:text-5xl">
            {contentPage.title}
          </h1>
          <div className="prose prose-stone mt-8 max-w-none prose-headings:text-stone-900 prose-p:text-stone-600 prose-li:text-stone-600 prose-strong:text-stone-900">
            <div dangerouslySetInnerHTML={{ __html: contentPage.content }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-about mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="border-b border-latik/15 px-8 pb-12 text-center sm:px-12 sm:pb-16">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-pulot">Our Story</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-kape sm:text-5xl md:text-6xl">
          Preserving Filipino Culinary Heritage
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-latik/78">
          From humble beginnings to your table — we&rsquo;re on a mission to share the authentic flavors of J&J Native Delicacies with the world.
        </p>
      </div>

      {/* Story */}
      <div className="section-divider mt-16 grid gap-12 pt-10 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(194,133,42,0.28),transparent_42%),linear-gradient(145deg,rgba(253,246,227,0.96),rgba(245,236,215,0.96))]">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <span className="text-6xl">🍘</span>
                <p className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-latik/62">Heritage Recipe Collection</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 right-0 hidden border-l-2 border-pulot/35 pl-5 lg:block">
            <p className="text-3xl font-black text-pulot">15+</p>
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.2em] text-latik/66">Years of Tradition</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-kape">A Heritage Worth Sharing</h2>
          <div className="mt-6 space-y-4 leading-8 text-latik/78">
            <p>
              J&J Native Delicacies was born from a deep love for Filipino culinary traditions. What started as a family kitchen preparing kakanin for local fiestas has grown into a beloved destination for authentic Filipino treats.
            </p>
            <p>
              Our founder, inspired by their lola&rsquo;s time-tested recipes, set out to preserve the flavors that define Filipino celebrations — from the sticky sweetness of kutsinta to the delicate layers of bibingka, each delicacy is a tribute to our rich cultural heritage.
            </p>
            <p>
              We believe that every bite of kakanin tells a story of regionalpride, family tradition, and the warmth of Filipino hospitality. That&rsquo;s why we prepare each item with the same care and dedication that our ancestors put into their cooking.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mt-24">
        <div className="text-center">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.26em] text-pulot">Guiding Principles</p>
          <h2 className="mt-3 text-3xl font-black text-kape">What We Stand For</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-latik/72">
            Our values guide everything we do — from sourcing ingredients to serving our customers.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="animate-rise border-t border-latik/14 pt-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pulot/14 text-pulot">
                <value.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-kape">{value.title}</h3>
              <p className="mt-2 text-sm leading-7 text-latik/72">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 border-t border-latik/15 px-8 py-16 text-center">
        <h2 className="text-3xl font-black text-kape">Ready to Taste Tradition?</h2>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-latik/76">
          Browse our handcrafted selection of J&J Native Delicacies and bring a taste of heritage to your table.
        </p>
        <a
          href="/menu"
          className="mt-8 inline-flex items-center border-b-2 border-pulot pb-1 text-[0.78rem] font-medium uppercase tracking-[0.2em] text-pulot transition-colors duration-300 ease-in-out hover:text-amber-500"
        >
          Explore Our Menu →
        </a>
      </div>
    </div>
  );
}

