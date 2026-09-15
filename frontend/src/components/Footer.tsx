import { useLocale } from "../i18n";

export default function Footer() {
  const { message } = useLocale();
  return (
    <footer className="shrink-0 py-3 px-6 border-t border-border bg-bg-card text-center text-xs text-text-muted">
      {message("footer.community")}
    </footer>
  );
}
