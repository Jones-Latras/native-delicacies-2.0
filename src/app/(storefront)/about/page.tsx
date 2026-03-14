import { Heart, Award, Leaf, Users } from "lucide-react";

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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our Story</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Preserving Filipino Culinary Heritage
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-500">
          From humble beginnings to your table — we&rsquo;re on a mission to share the authentic flavors of Filipino native delicacies with the world.
        </p>
      </div>

      {/* Story */}
      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <span className="text-6xl">🍘</span>
                <p className="mt-4 text-sm font-medium text-primary/60">Heritage Recipe Collection</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 hidden rounded-xl bg-white p-4 shadow-lg lg:block">
            <p className="text-3xl font-bold text-primary">15+</p>
            <p className="text-sm text-stone-500">Years of Tradition</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-stone-900">A Heritage Worth Sharing</h2>
          <div className="mt-6 space-y-4 text-stone-600 leading-relaxed">
            <p>
              Native Delicacies was born from a deep love for Filipino culinary traditions. What started as a family kitchen preparing kakanin for local fiestas has grown into a beloved destination for authentic Filipino treats.
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
          <h2 className="text-3xl font-bold text-stone-900">What We Stand For</h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-500">
            Our values guide everything we do — from sourcing ingredients to serving our customers.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-stone-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <value.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-stone-900">{value.title}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-8 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to Taste Tradition?</h2>
        <p className="mx-auto mt-3 max-w-lg text-white/80">
          Browse our handcrafted selection of Filipino native delicacies and bring a taste of heritage to your table.
        </p>
        <a
          href="/menu"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90"
        >
          Explore Our Menu →
        </a>
      </div>
    </div>
  );
}
