import type { PolicyPageContent } from "@/lib/policy-content";

interface PolicyPageContentProps {
  content: PolicyPageContent;
}

export function PolicyPageContent({ content }: PolicyPageContentProps) {
  return (
    <div>
      <p>{content.hero.eyebrow}</p>
      <h1>{content.hero.title}</h1>
      <p>{content.hero.intro}</p>
      <p>
        <em>
          {content.hero.updatedLabel}: {content.hero.updatedDate}
        </em>
      </p>

      {content.sections.map((section) => (
        <section key={section.key}>
          <h2>{section.title}</h2>
          {section.description.trim().length > 0 ? <p>{section.description}</p> : null}
          {section.items.length > 0 ? (
            <ul>
              {section.items.map((item, index) => (
                <li key={`${section.key}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
