import { Award, Heart, Leaf, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseAboutPageContent } from "@/lib/about-content";

export const dynamic = "force-dynamic";

const VALUE_ICONS = [Heart, Award, Leaf, Users] as const;

export default async function AboutPage() {
  const contentPage = await prisma.contentPage.findUnique({
    where: { slug: "about" },
    select: { title: true, content: true },
  });

  const aboutContent = parseAboutPageContent(contentPage);
  const hasDetails = aboutContent.details.contentHtml.trim().length > 0;
  const storyParagraphs = aboutContent.story.paragraphs.filter((paragraph) => paragraph.trim().length > 0);
  const valueItems = aboutContent.values.items.filter(
    (item) => item.title.trim().length > 0 || item.description.trim().length > 0,
  );

  return (
    <div className="artisan-about mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-latik/15 px-8 pb-12 text-center sm:px-12 sm:pb-16">
        {aboutContent.hero.eyebrow.trim().length > 0 ? (
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-pulot">
            {aboutContent.hero.eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-4xl font-black tracking-tight text-kape sm:text-5xl md:text-6xl">
          {aboutContent.title}
        </h1>
        {aboutContent.hero.intro.trim().length > 0 ? (
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-latik/78">{aboutContent.hero.intro}</p>
        ) : null}
      </div>

      <div className="section-divider mt-16 grid gap-12 pt-10 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(194,133,42,0.28),transparent_42%),linear-gradient(145deg,rgba(253,246,227,0.96),rgba(245,236,215,0.96))]">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <span className="text-6xl">{aboutContent.story.mediaHeadline}</span>
                {aboutContent.story.mediaCaption.trim().length > 0 ? (
                  <p className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-latik/62">
                    {aboutContent.story.mediaCaption}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          {(aboutContent.story.statValue.trim().length > 0 || aboutContent.story.statLabel.trim().length > 0) && (
            <div className="absolute -bottom-6 right-0 hidden border-l-2 border-pulot/35 pl-5 lg:block">
              {aboutContent.story.statValue.trim().length > 0 ? (
                <p className="text-3xl font-black text-pulot">{aboutContent.story.statValue}</p>
              ) : null}
              {aboutContent.story.statLabel.trim().length > 0 ? (
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.2em] text-latik/66">
                  {aboutContent.story.statLabel}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div>
          {aboutContent.story.eyebrow.trim().length > 0 ? (
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pulot">
              {aboutContent.story.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-3xl font-black text-kape">{aboutContent.story.title}</h2>
          {storyParagraphs.length > 0 ? (
            <div className="mt-6 space-y-4 leading-8 text-latik/78">
              {storyParagraphs.map((paragraph, index) => (
                <p key={`story-paragraph-${index}`}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {hasDetails ? (
        <div className="section-divider mt-16 pt-10">
          <div className="mx-auto max-w-4xl">
            {(aboutContent.details.eyebrow.trim().length > 0 || aboutContent.details.title.trim().length > 0) && (
              <div className="mb-8 text-center">
                {aboutContent.details.eyebrow.trim().length > 0 ? (
                  <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pulot">
                    {aboutContent.details.eyebrow}
                  </p>
                ) : null}
                {aboutContent.details.title.trim().length > 0 ? (
                  <h2 className="mt-3 text-3xl font-black text-kape">{aboutContent.details.title}</h2>
                ) : null}
              </div>
            )}
            <div className="prose prose-stone mx-auto max-w-4xl prose-headings:text-stone-900 prose-p:text-stone-600 prose-li:text-stone-600 prose-strong:text-stone-900">
              <div dangerouslySetInnerHTML={{ __html: aboutContent.details.contentHtml }} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-24">
        <div className="text-center">
          {aboutContent.values.eyebrow.trim().length > 0 ? (
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.26em] text-pulot">
              {aboutContent.values.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-3xl font-black text-kape">{aboutContent.values.title}</h2>
          {aboutContent.values.intro.trim().length > 0 ? (
            <p className="mx-auto mt-4 max-w-xl leading-7 text-latik/72">{aboutContent.values.intro}</p>
          ) : null}
        </div>

        {valueItems.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {valueItems.map((value, index) => {
              const Icon = VALUE_ICONS[index] ?? Heart;

              return (
                <div key={`${value.title}-${index}`} className="animate-rise border-t border-latik/14 pt-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pulot/14 text-pulot">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  {value.title.trim().length > 0 ? <h3 className="mt-4 text-lg font-bold text-kape">{value.title}</h3> : null}
                  {value.description.trim().length > 0 ? (
                    <p className="mt-2 text-sm leading-7 text-latik/72">{value.description}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-24 border-t border-latik/15 px-8 py-16 text-center">
        <h2 className="text-3xl font-black text-kape">{aboutContent.cta.title}</h2>
        {aboutContent.cta.text.trim().length > 0 ? (
          <p className="mx-auto mt-3 max-w-lg leading-7 text-latik/76">{aboutContent.cta.text}</p>
        ) : null}
        {aboutContent.cta.label.trim().length > 0 ? (
          <a
            href={aboutContent.cta.href.trim().length > 0 ? aboutContent.cta.href : "/menu"}
            className="mt-8 inline-flex items-center border-b-2 border-pulot pb-1 text-[0.78rem] font-medium uppercase tracking-[0.2em] text-pulot transition-colors duration-300 ease-in-out hover:text-amber-500"
          >
            {aboutContent.cta.label}
          </a>
        ) : null}
      </div>
    </div>
  );
}
