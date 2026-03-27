export default function Footer() {
  return (
    <footer className="border-t border-dashed border-border py-8 px-6">
      <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground space-y-1">
        <p>Destinos Oposiciones &mdash; Herramienta gratuita para opositores.</p>
        <p>
          Una herramienta de{" "}
          <a
            href="https://www.rafatorresgarcia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium hover:underline underline-offset-2"
          >
            rafatorresgarcia.com
          </a>
        </p>
      </div>
    </footer>
  );
}
