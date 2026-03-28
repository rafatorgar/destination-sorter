import Link from "next/link";
import { posts } from "@/lib/posts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Consejos y guías para opositores: cómo elegir destino, ordenar plazas por distancia, preparar bolsas de interinos y más.",
  alternates: {
    canonical: "https://destinosoposiciones.rafatorresgarcia.com/blog",
  },
};

export default function BlogPage() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          Blog
        </h1>
        <p className="text-muted-foreground mb-12">
          Guías y consejos para elegir destino en oposiciones, bolsas de
          interinos y concursos de traslados.
        </p>

        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block space-y-2">
                <time className="text-xs font-mono text-muted-foreground/60">
                  {new Date(post.date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="text-xl font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {post.description}
                </p>
              </Link>
              <div className="mt-4 border-b border-dashed border-border" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
