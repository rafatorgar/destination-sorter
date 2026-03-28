import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { posts, getPost, getAllSlugs } from "@/lib/posts";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://destinosoposiciones.rafatorresgarcia.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://destinosoposiciones.rafatorresgarcia.com/blog/${post.slug}`,
    },
  };
}

function renderMarkdown(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      elements.push(<hr key={i} className="my-8 border-dashed border-border" />);
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-xl font-semibold text-foreground mt-10 mb-4"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-lg font-semibold text-foreground mt-8 mb-3"
        >
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // List item
    if (line.trimStart().startsWith("- ")) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("- ")) {
        listItems.push(
          <li key={i} className="text-muted-foreground">
            {renderInline(lines[i].trimStart().slice(2))}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-6 space-y-1 my-4">
          {listItems}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trimStart())) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trimStart())) {
        const text = lines[i].trimStart().replace(/^\d+\.\s/, "");
        listItems.push(
          <li key={i} className="text-muted-foreground">
            {renderInline(text)}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-6 space-y-1 my-4">
          {listItems}
        </ol>
      );
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].trimStart().startsWith("- ") &&
      !/^\d+\.\s/.test(lines[i].trimStart()) &&
      lines[i].trim() !== "---"
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p
          key={`p-${i}`}
          className="text-muted-foreground leading-relaxed my-4"
        >
          {renderInline(paraLines.join(" "))}
        </p>
      );
    }
  }

  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match bold, links, and inline code
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)|`(.+?)`/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold
      parts.push(
        <strong key={match.index} className="text-foreground font-semibold">
          {match[1]}
        </strong>
      );
    } else if (match[2] && match[3]) {
      // Link
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      // Inline code
      parts.push(
        <code
          key={match.index}
          className="bg-muted px-1.5 py-0.5 rounded text-sm"
        >
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function BlogPost({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  // Find adjacent posts for navigation
  const currentIndex = posts.findIndex((p) => p.slug === params.slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  const faqJsonLd = post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <section className="py-16 px-6">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Blog
        </Link>

        {/* Header */}
        <header className="mt-6 mb-10">
          <time className="text-xs font-mono text-muted-foreground/60">
            {new Date(post.date).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
            {post.title}
          </h1>
        </header>

        {/* Content */}
        <div>{renderMarkdown(post.content)}</div>
      </article>

      {/* FAQs + CTA — same style as landing */}
      {post.faqs.length > 0 && (
        <div className="max-w-3xl mx-auto mt-16 border-x border-dashed border-border">
          {/* FAQs */}
          <section className="bg-white border-y border-dashed border-border py-16 px-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Preguntas frecuentes
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {post.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-foreground">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Gap */}
          <div className="py-8" />

          {/* CTA */}
          <section className="bg-white border-y border-dashed border-border py-16 px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">
                ¿Listo para organizar tus destinos?
              </h3>
              <p className="text-muted-foreground mb-8">
                Sube tu Excel y obtén las distancias en segundos.
              </p>
              <Link href="/herramienta">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl"
                >
                  Subir mis destinos
                </Button>
              </Link>
            </div>
          </section>
        </div>
      )}

      <article className="max-w-3xl mx-auto">
        {/* Navigation */}
        <nav className="mt-16 pt-8 border-t border-dashed border-border flex justify-between gap-8">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group text-sm max-w-[45%]"
            >
              <span className="text-muted-foreground/60">&larr; Anterior</span>
              <p className="text-foreground font-medium group-hover:text-muted-foreground transition-colors mt-1">
                {prevPost.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group text-sm text-right max-w-[45%]"
            >
              <span className="text-muted-foreground/60">Siguiente &rarr;</span>
              <p className="text-foreground font-medium group-hover:text-muted-foreground transition-colors mt-1">
                {nextPost.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </section>
  );
}
