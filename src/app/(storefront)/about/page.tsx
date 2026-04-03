import Link from "next/link";
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
  const storyParagraphs = aboutContent.story.paragraphs.filter(
    (paragraph) => paragraph.trim().length > 0
  );
  const valueItems = aboutContent.values.items.filter(
    (item) => item.title.trim().length > 0 || item.description.trim().length > 0
  );

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF6F0_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
      <div className="pointer-events-none absolute left-[9%] top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.65),transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-8 right-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(160,82,45,0.10),transparent_72%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          {aboutContent.hero.eyebrow.trim().length > 0 ? (
            <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
              {aboutContent.hero.eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012] sm:text-[3rem]">
            {aboutContent.title}
          </h1>
          <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
          {aboutContent.hero.intro.trim().length > 0 ? (
            <p className="mx-auto mt-5 max-w-2xl font-[family-name:var(--font-label)] text-base italic leading-7 text-[#7A6A55]">
              {aboutContent.hero.intro}
            </p>
          ) : null}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[24px] border border-[#C9A87C] bg-[linear-gradient(145deg,#FFF7E8_0%,#F5E6C8_55%,#FAF6F0_100%)] p-8 shadow-[0_20px_50px_rgba(90,50,20,0.08)] sm:p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(160,82,45,0.16),transparent_70%)]" />
            <div className="relative text-center">
              <span className="text-6xl sm:text-7xl">{aboutContent.story.mediaHeadline}</span>
              {aboutContent.story.mediaCaption.trim().length > 0 ? (
                <p className="mt-5 font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.16em] text-[#7A6A55]">
                  {aboutContent.story.mediaCaption}
                </p>
              ) : null}
            </div>
            {(aboutContent.story.statValue.trim().length > 0 ||
              aboutContent.story.statLabel.trim().length > 0) && (
              <div className="mt-10 rounded-[16px] border border-[#C9A87C] bg-[#FFFDF8]/85 px-5 py-4 text-center sm:absolute sm:bottom-6 sm:right-6 sm:mt-0 sm:min-w-[180px]">
                {aboutContent.story.statValue.trim().length > 0 ? (
                  <p className="font-[family-name:var(--font-display)] text-3xl text-[#A0522D]">
                    {aboutContent.story.statValue}
                  </p>
                ) : null}
                {aboutContent.story.statLabel.trim().length > 0 ? (
                  <p className="mt-1 font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.12em] text-[#7A6A55]">
                    {aboutContent.story.statLabel}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-8 shadow-[0_18px_40px_rgba(90,50,20,0.06)] sm:p-10">
            {aboutContent.story.eyebrow.trim().length > 0 ? (
              <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                {aboutContent.story.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[#3E2012]">
              {aboutContent.story.title}
            </h2>
            {storyParagraphs.length > 0 ? (
              <div className="mt-6 space-y-4 font-[family-name:var(--font-label)] text-[15px] leading-8 text-[#7A6A55]">
                {storyParagraphs.map((paragraph, index) => (
                  <p key={`story-paragraph-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {hasDetails ? (
          <div className="mt-16 rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-8 shadow-[0_18px_40px_rgba(90,50,20,0.06)] sm:p-10">
            {(aboutContent.details.eyebrow.trim().length > 0 ||
              aboutContent.details.title.trim().length > 0) && (
              <div className="mb-8 text-center">
                {aboutContent.details.eyebrow.trim().length > 0 ? (
                  <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                    {aboutContent.details.eyebrow}
                  </p>
                ) : null}
                {aboutContent.details.title.trim().length > 0 ? (
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[#3E2012]">
                    {aboutContent.details.title}
                  </h2>
                ) : null}
              </div>
            )}
            <div className="prose mx-auto max-w-4xl prose-headings:font-[family-name:var(--font-display)] prose-headings:text-[#3E2012] prose-p:font-[family-name:var(--font-label)] prose-p:text-[#7A6A55] prose-li:font-[family-name:var(--font-label)] prose-li:text-[#7A6A55] prose-strong:text-[#3E2012]">
              <div dangerouslySetInnerHTML={{ __html: aboutContent.details.contentHtml }} />
            </div>
          </div>
        ) : null}

        <div className="mt-16">
          <div className="text-center">
            {aboutContent.values.eyebrow.trim().length > 0 ? (
              <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                {aboutContent.values.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[#3E2012]">
              {aboutContent.values.title}
            </h2>
            {aboutContent.values.intro.trim().length > 0 ? (
              <p className="mx-auto mt-4 max-w-xl font-[family-name:var(--font-label)] text-[15px] leading-7 text-[#7A6A55]">
                {aboutContent.values.intro}
              </p>
            ) : null}
          </div>

          {valueItems.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {valueItems.map((value, index) => {
                const Icon = VALUE_ICONS[index] ?? Heart;

                return (
                  <div
                    key={`${value.title}-${index}`}
                    className="rounded-[20px] border border-[#C9A87C] bg-[#FFFDF8] p-6 text-center shadow-[0_12px_28px_rgba(90,50,20,0.05)]"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5E6C8] text-[#A0522D]">
                      <Icon className="h-6 w-6" strokeWidth={1.6} />
                    </div>
                    {value.title.trim().length > 0 ? (
                      <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl text-[#3E2012]">
                        {value.title}
                      </h3>
                    ) : null}
                    {value.description.trim().length > 0 ? (
                      <p className="mt-3 font-[family-name:var(--font-label)] text-sm leading-7 text-[#7A6A55]">
                        {value.description}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="mt-16 rounded-[24px] border border-[#C9A87C] bg-[linear-gradient(135deg,#F5EFE6_0%,#FFFDF8_100%)] px-8 py-14 text-center shadow-[0_18px_40px_rgba(90,50,20,0.06)]">
          <h2 className="font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[#3E2012]">
            {aboutContent.cta.title}
          </h2>
          {aboutContent.cta.text.trim().length > 0 ? (
            <p className="mx-auto mt-4 max-w-lg font-[family-name:var(--font-label)] text-[15px] leading-7 text-[#7A6A55]">
              {aboutContent.cta.text}
            </p>
          ) : null}
          {aboutContent.cta.label.trim().length > 0 ? (
            <Link
              href={aboutContent.cta.href.trim().length > 0 ? aboutContent.cta.href : "/menu"}
              className="mt-8 inline-flex rounded-full bg-[#A0522D] px-6 py-3 font-[family-name:var(--font-label)] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#7D3D1A]"
            >
              {aboutContent.cta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
