export function ThemeScript() {
  const script = `(() => {
    const storageKey = "payengine-theme";
    const root = document.documentElement;
    const stored = localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";
    root.classList.toggle("dark", theme === "dark");
  })();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
