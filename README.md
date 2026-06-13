# mindestsicherung.com

Schneller, klarer Online-Rechner für die österreichische Mindestsicherung /
Sozialhilfe. Statisches Astro-Setup, Svelte-Insel für den Rechner, Tailwind v4
fürs Styling.

> **Status (MVP):** Wien voll funktionsfähig, andere Bundesländer als „in
> Prüfung" markiert. Brief siehe [BRIEF.md](./BRIEF.md).

---

## Lokal entwickeln

```sh
npm install        # nur einmal
npm run dev        # Dev-Server auf http://localhost:4321
npm run build      # Production-Build nach ./dist/
npm run preview    # ./dist/ lokal anschauen
```

Node-Version: ≥ 22.12 (siehe `package.json`).

---

## Dateien, die du regelmäßig anfasst

| Datei | Was drin ist | Wann anfassen |
| --- | --- | --- |
| [`src/data/saetze-2026.ts`](./src/data/saetze-2026.ts) | Alle Geldbeträge & Regeln pro Bundesland | Jährlich, sobald neue Sätze veröffentlicht sind |
| [`src/lib/calc.ts`](./src/lib/calc.ts) | Reine Rechenlogik | Nur wenn sich die Berechnungsformel ändert |
| [`src/components/Rechner.svelte`](./src/components/Rechner.svelte) | Rechner-Oberfläche | UI-Änderungen am Rechner |
| [`src/pages/`](./src/pages/) | Seiteninhalte (Hauptseite, Wien, Impressum, Datenschutz) | Content-Updates |

### Jährliches Update der Sätze (Anfang Jänner)

1. Neue Werte vom Sozialministerium und der jeweiligen Landesregierung holen
   (Quellenlinks stehen oben in `saetze-2026.ts`).
2. Werte in `src/data/saetze-2026.ts` ersetzen, `STAND.datum` aktualisieren.
3. `npm run build` lokal laufen lassen — wenn der Build durchgeht, sind die
   Typen sauber.
4. Commit + Push: Cloudflare Pages deployed automatisch.

> **Wichtig:** Niemals raten. Wenn ein Wert unsicher ist, das Bundesland auf
> `status: 'draft'` lassen — die UI zeigt dann den klaren Hinweis „werden
> derzeit geprüft" statt einer falschen Zahl.

---

## Projektstruktur

```
src/
├── components/
│   └── Rechner.svelte     # Der interaktive Rechner (einzige Insel mit JS)
├── data/
│   └── saetze-2026.ts     # ⭐ Zentrale Daten-Datei für jährliches Update
├── layouts/
│   └── Layout.astro       # Globales Layout mit Header, Footer, SEO-Tags
├── lib/
│   └── calc.ts            # Reine Rechenlogik (testbar, ohne UI)
├── pages/
│   ├── index.astro                 # Hauptseite
│   ├── mindestsicherung-wien.astro # Wien-Seite (Wien ist im Rechner fixiert)
│   ├── impressum.astro
│   └── datenschutz.astro
└── styles/
    └── global.css         # Tailwind + Design-Tokens (Farben, Schrift)
```

---

## Deployment: Cloudflare Pages

Cloudflare Pages ist kostenlos für statische Seiten (500 Builds / Monat,
unbegrenzte Bandbreite). Jeder Push auf `main` triggert automatisch einen
neuen Deploy.

### Erstmaliges Setup (10 Minuten, einmalig)

1. **Cloudflare-Account anlegen** auf https://dash.cloudflare.com/sign-up
   (kostenlos, keine Kreditkarte nötig).
2. Im Dashboard links auf **Workers & Pages** → Tab **Pages** → **Create a project**.
3. **Connect to Git** → GitHub autorisieren → Repo `mindestsicherung-com` auswählen.
4. Build-Settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** (leer lassen)
   - **Node version (Environment Variables):**
     `NODE_VERSION = 22`
5. **Save and Deploy.** Erster Build läuft ~1 Minute, dann ist die Seite live
   unter `https://mindestsicherung-com.pages.dev` (oder so ähnlich).

### Custom Domain anbinden (mindestsicherung.com)

1. Im Pages-Projekt → Tab **Custom domains** → **Set up a custom domain**.
2. `mindestsicherung.com` eingeben.
3. Cloudflare zeigt entweder „Add via Cloudflare DNS" (wenn die Domain
   schon bei Cloudflare liegt) oder die nötigen CNAME-Einträge, die du beim
   bisherigen Registrar setzen musst.
4. Domain-Validierung dauert in der Regel 5–30 Minuten. HTTPS-Zertifikat
   wird automatisch ausgestellt.
5. Optional auch `www.mindestsicherung.com` als zweite Custom Domain
   hinzufügen (Cloudflare leitet automatisch um, je nach Setup).

### Wenn du Cloudflare lieber nicht nutzen willst

Astro produziert reines `dist/` mit HTML/CSS/JS — das läuft auf jedem
statischen Host. Alternativen: Netlify, Vercel, GitHub Pages. Alle drei
können direkt mit dem Repo verbunden werden, ähnliche Schritte wie oben.

---

## Was noch fehlt (nach MVP-Abnahme)

- 8 weitere Bundesländer-Seiten (Werte in `saetze-2026.ts` verifizieren,
  jeweils eigene `src/pages/mindestsicherung-<land>.astro`).
- Auszahlungstermine-Seite (siehe BRIEF Abschnitt 2).
- FAQ-Hub (Vermögen, Anrechnung, Arbeitspflicht, subsidiär Schutzberechtigte).
- Cookie-Consent-Banner (sobald AdSense aktiv wird).
- Sitemap-Integration (`@astrojs/sitemap`), `robots.txt`.
- Strukturierte Daten (FAQPage-Schema beim FAQ).
- AdSense-Platzhalter-Komponente.

---

## Disclaimer

Diese Seite liefert eine unverbindliche Orientierung. Sie ersetzt keine
Rechts- oder Sozialberatung. Verbindliche Auskünfte erteilen ausschließlich
die zuständigen Stellen des jeweiligen Bundeslandes.
