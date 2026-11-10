// Bolder fork: upstream rendered a "Powered by Docmost" button linking to docmost.com on
// every public page. Removed; kept as an empty component so the two upstream call sites
// (share-shell.tsx, shared-page.tsx) merge cleanly.
export default function ShareBranding(): null {
  return null;
}
