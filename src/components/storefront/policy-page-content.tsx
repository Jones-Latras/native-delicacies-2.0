import type { PolicyPageContent } from "@/lib/policy-content";

interface PolicyPageContentProps {
  content: PolicyPageContent;
}

export function PolicyPageContent({ content }: PolicyPageContentProps) {
  return (
    <div className="not-prose">
      <div className="border-b border-[#C9A87C]/45 pb-8">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#A0522D]">
          {content.hero.eyebrow}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#3E2012] sm:text-[2.85rem]">
          {content.hero.title}
        </h1>
        <div className="mt-4 h-0.5 w-16 rounded-full bg-[#A0522D]" />
        <p className="mt-5 max-w-3xl text-[1rem] italic leading-8 text-[#7A6A55]">
          {content.hero.intro}
        </p>
        <p className="mt-4 text-sm text-[#7A6A55]">
          <em>
          {content.hero.updatedLabel}: {content.hero.updatedDate}
          </em>
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {content.sections.map((section) => (
          <section key={section.key} className="border-b border-[#C9A87C]/25 pb-8 last:border-b-0 last:pb-0">
            <h2 className="font-[family-name:var(--font-display)] text-[1.7rem] text-[#3E2012]">
              {section.title}
            </h2>
            {section.description.trim().length > 0 ? (
              <p className="mt-3 text-[0.98rem] leading-8 text-[#5F4B3A]">{section.description}</p>
            ) : null}
          {section.items.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {section.items.map((item, index) => (
                <li
                  key={`${section.key}-${index}`}
                  className="flex gap-3 text-[0.96rem] leading-8 text-[#5F4B3A]"
                >
                  <span className="mt-[0.9rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#A0522D]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
