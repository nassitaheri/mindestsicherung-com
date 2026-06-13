# BRIEF: mindestsicherung.com

> Diese Datei legst du ins Repo-Root. In Claude Code sagst du dann nur:
> **"Lies BRIEF.md vollständig und setz das Projekt danach um. Starte mit dem MVP-Scope. Frag bei größeren Architektur-Entscheidungen nach, bevor du loslegst."**

---

## 1. Kontext

- Betreiber: Grafik-Designer aus Wien, technisch fit, kein Backend-Profi. Erklär wichtige Schritte knapp und nachvollziehbar.
- Domain: **mindestsicherung.com**
- Ziel: organischer SEO-Traffic plus kleiner passiver Nebenverdienst (AdSense, dezente Affiliate-Platzierungen, später ggf. ein PDF-Produkt).
- Thema: österreichische **Mindestsicherung / Sozialhilfe**. Hohe, jährlich wiederkehrende Suchnachfrage, Sätze ändern sich jährlich, Regeln unterscheiden sich stark je Bundesland.
- Unfairer Vorteil: **Design und UX**. Die existierenden Seiten sind cluttered, langsam, werbeverseucht. Wir gewinnen über Klarheit, Geschwindigkeit, Vertrauen, nicht über Backlink-Masse.

## 2. Produkt

Ein **"Rechner-First" Info-Hub**:

1. **Kernstück:** ein sauberer, schneller Mindestsicherungs-Rechner (siehe Rechenlogik unten).
2. 9 Bundesländer-Seiten (eigene Keywords: "Mindestsicherung Wien", "Sozialhilfe Niederösterreich" usw.).
3. Eine starke Übersichts-/Hauptseite.
4. Auszahlungstermine-Seite (wiederkehrender Traffic, geringer Pflegeaufwand).
5. FAQ-Hub (Vermögen, Anrechnung, Arbeitspflicht, subsidiär Schutzberechtigte).
6. Jährlicher "Was ändert sich 2026/2027"-Artikel.

## 3. MVP-Scope (zuerst nur das bauen, dann stoppen und zeigen)

- Rechner, voll funktionsfähig **für Wien** (Wien-Daten sind unten vollständig und geprüft).
- Hauptseite.
- Wien-Seite.
- Impressum- und Datenschutz-Platzhalterseiten.
- GitHub-Repo plus Deploy-Workflow eingerichtet (Abschnitt 8).

Erst nach OK die übrigen Bundesländer und Seiten skalieren.

---

## 4. Rechenlogik (Kern)

Modell pro Haushalt ("Bedarfsgemeinschaft"):

1. **Gesamtbedarf** = Summe der Mindeststandards aller Haushaltsmitglieder:
   - Alleinstehend / Alleinerziehend (ab 25): voller Satz
   - Jeder Erwachsene in Ehe/Partnerschaft/Lebensgemeinschaft/WG (ab 25): 70%-Satz
   - Pro minderjährigem Kind: Kindersatz (je Bundesland unterschiedlich)
   - Plus Behindertenzuschlag je qualifizierter Person
   - Plus optionaler Alleinerziehenden-Zuschlag (je Bundesland)
2. **Deckelung:** Summe der Geldleistungen der Erwachsenen pro Haushalt darf 175% des Richtsatzes nicht überschreiten (2026 rund 2.152,31 €).
3. **Minus anrechenbares Einkommen** aller Haushaltsmitglieder.
4. **Ergebnis** = ergänzende Mindestsicherung (der Auszahlbetrag). Liegt das Einkommen über dem Gesamtbedarf, besteht kein Anspruch.
5. **Vermögens-Check:** Übersteigt das verwertbare Vermögen den Freibetrag (7.379,34 € pro volljähriger Person), besteht grundsätzlich kein Anspruch, Ersparnisse müssen zuerst verbraucht werden. Ausnahmen: selbst bewohnte Eigentumswohnung (Hauptwohnsitz), berufs- oder behinderungsbedingt notwendiges Auto, Wohnungseinrichtung.
6. **Output:** klarer Orientierungsbetrag plus Hinweis, dass eine **Mietbeihilfe** zusätzlich möglich, aber separat und kompliziert geregelt ist (nicht im Rechner abbilden).

**Pflicht-Disclaimer bei jedem Ergebnis:** "Unverbindliche Orientierung, keine Rechts- oder Sozialberatung. Maßgeblich sind die zuständigen Stellen des jeweiligen Bundeslandes."

---

## 5. Geprüfte Daten 2026

> Lege diese in **EINER** zentralen Datei ab, z.B. `src/data/saetze-2026.ts`, klar kommentiert, je Bundesland. Jährliches Update darf nur diese Datei betreffen.

### Bundesweit (SH-GG, gesichert)

| Größe | Wert 2026 |
|---|---|
| Höchstsatz Alleinstehend/Alleinerziehend (100%) | 1.229,89 € |
| Erwachsener in Gemeinschaft (70%) | 860,92 € |
| Paar/Lebensgemeinschaft (140%) | 1.721,85 € |
| Deckelung Erwachsene pro Haushalt (175%) | ~2.152,31 € |
| Vermögensfreibetrag pro volljähriger Person | 7.379,34 € |
| Behindertenzuschlag (verpflichtend) | ~221 € (Wien 221,38 €) |
| Alleinerziehenden-Zuschlag (optional, je Land) | ~148 € (1. Kind) bis ~37 € (ab 4. Kind) pro Kind |
| Wohnkosten-Aufschlag (Länder-Option, bis +30%) | bis +368,97 € → bis 1.598,86 € für Alleinstehende |
| Mindestbetrag-Floor (Länder-Option, bis 20%) | bis 246 € pro Person |
| Geringfügigkeitsgrenze | 551,10 €/Monat |
| Auszahlung | 12x jährlich |

Grundregel: Das SH-GG definiert nur **Höchstsätze (Obergrenzen)**, kein bundesweites Minimum. Jedes Bundesland kann darunter bleiben. **Kinderbeträge sind seit dem VfGH-Urteil 2019 reine Ländersache.** Wien, Salzburg, Kärnten, Burgenland zahlen flach pro Kind, andere Länder staffeln.

### Wien (vollständig geprüft, MVP-Grundlage)

In Wien heißt das System weiterhin **"Mindestsicherung"** (nicht "Sozialhilfe").

| Personengruppe | Mindeststandard 2026 |
|---|---|
| Alleinwohnend / Alleinerziehend ab 25 / Pensionsalter / dauerhaft arbeitsunfähig | 1.229,89 € |
| Person ab 25 in Ehe/Partnerschaft/Lebensgemeinschaft/WG (pro Person) | 860,92 € |
| Pro minderjährigem Kind (flach, unabhängig von Kinderzahl) | 332,07 € |
| Behindertenzuschlag (Behindertenpass §40 BBG) | 221,38 € |
| Vermögensfreibetrag pro volljähriger Person | 7.379,34 € |

**Wien-Änderungen ab 1.1.2026 (im Rechner und Content berücksichtigen):**
- Subsidiär Schutzberechtigte: **kein** Anspruch mehr auf Mindestsicherung, stattdessen Grundversorgung.
- "Elternzuschlag" (~54,41 € pro volljähriger Person mit minderjährigen Kindern): **ersatzlos gestrichen** per 31.12.2025.
- Mindestsicherung wird einheitlich in **75% Lebensunterhalt / 25% Wohnbedarf** aufgeteilt. Der 25%-Wohnanteil wird von der Mietbeihilfe abgezogen, ab 2026 auch bei Kindern.
- WGs werden wie Bedarfsgemeinschaften behandelt (geringere Pro-Kopf-Leistung, 70%-Satz).
- Junge Erwachsene 18–25: erhöhter Satz nur bei Ausbildung/Erwerb. Seit 1.1.2026 zählt Teilnahme an AMS-/Integrationsmaßnahmen dafür nicht mehr.

**Rechenbeispiel Wien (geprüft):** Paar (beide 25+) mit 2 Kindern: 860,92 + 860,92 + 332,07 + 332,07 = **2.385,98 €** Gesamtbedarf. Davon wird das Einkommen aller Personen abgezogen.

### Andere Bundesländer (TODO-VERIFY)

Für Niederösterreich, Oberösterreich, Steiermark, Kärnten, Salzburg, Tirol, Vorarlberg, Burgenland gilt:
- Erwachsenen-Sätze orientieren sich an den Höchstsätzen oben (Niederösterreich nahezu 1:1).
- **Tirol** hat noch kein Ausführungsgesetz (Stand 1.1.2026, kurz vor Umsetzung): Paare liegen höher, rund **1.845 €** statt 1.721,85 €.
- **Kinderbeträge, Wohnkosten-Regeln, Alleinerziehenden-Zuschläge und Sanktionsstufen pro Land sind einzeln aus den Landes-Ausführungsgesetzen bzw. offiziellen Landesseiten zu verifizieren.**
- **Erfinde keine Länder-Details.** Wo du unsicher bist: markiere die Stelle im Code mit `// TODO-VERIFY` plus Quellenangabe und blende im UI für dieses Land einen klaren Hinweis ein ("Werte für [Land] werden derzeit geprüft").

**Offizielle Quellen zum Verifizieren:**
- Sozialministerium: https://www.sozialministerium.gv.at/Themen/Soziales/Sozialhilfe-und-Mindestsicherung.html
- oesterreich.gv.at: https://www.oesterreich.gv.at
- Stadt Wien: https://www.wien.gv.at
- Jeweilige Landesregierung + RIS (Rechtsinformationssystem) für die Ausführungsgesetze.

---

## 6. UI/UX-Anforderungen (hoher Stellenwert)

Der Betreiber ist Designer, das Design ist das Differenzierungsmerkmal. Kein AI-Default-Look.

- **Mobile-first.** Der Großteil des Traffics kommt mobil.
- **Rechner above the fold** auf jeder relevanten Seite. Ein klares, großes Ergebnis, dann die Erklärung dazu.
- **Progressive Disclosure:** nicht alle Felder auf einmal. Schrittweise (Bundesland → Haushalt → Einkommen → Ergebnis). Wenige Felder sichtbar, klare Defaults.
- **Sofortiges Feedback:** Ergebnis aktualisiert sich live bei Eingabe, kein "Berechnen"-Reload nötig.
- **Klare Typo-Hierarchie**, großzügiger Weißraum, EINE ruhige Akzentfarbe, ruhiger "öffentlich-rechtlich seriöser" Look, nicht reißerisch.
- **Barrierefrei (WCAG 2.1 AA):** ausreichende Kontraste, vollständige Tastaturbedienung, sichtbarer Fokus, korrekte Labels und ARIA, Touch-Targets mind. 44px.
- **Vertrauenssignale:** sichtbare "Stand: [Datum]"-Angabe, Quellenhinweise, Disclaimer, Impressum verlinkt.
- **Performance als UX:** Ziel Lighthouse 95+ in allen Kategorien. Kein Layout-Shift, schnelle Interaktion.
- Ergebnis-Erklärung in **einfacher Sprache**, weil viele Betroffene unter Stress und Bildungsdruck suchen.

## 7. Tech-Stack

- **Astro** (statische Ausgabe, top SEO, Inhalte als Markdown/MDX).
- Rechner als **interaktive Insel** (Svelte oder React, deine Wahl, möglichst wenig Client-JS).
- **Tailwind** fürs Styling.
- Inhalte als Markdown/MDX in `src/content/`.
- Sätze/Logik-Daten zentral in `src/data/`.
- Saubere, kommentierte Struktur, damit der Betreiber jährlich selbst die Sätze updaten kann.

## 8. GitHub + Hosting (Hostgator)

Gehostet wird auf **Hostgator** (klassisches Shared Hosting mit cPanel). Astro liefert statisches HTML/CSS/JS, das dort problemlos läuft.

**Setup, das du einrichten und dokumentieren sollst:**

1. **Git-Repo** initialisieren, sinnvolle Commits, sauberes `.gitignore` (node_modules, dist).
2. GitHub-Repo: Der Betreiber legt es unter seinem GitHub-Account an (oder du führst ihn durch `gh repo create`). Remote verbinden.
3. **Auto-Deploy via GitHub Actions zu Hostgator per FTP:**
   - Workflow in `.github/workflows/deploy.yml`: bei Push auf `main` → `npm ci` → `npm run build` → FTP-Upload von `dist/` nach Hostgator.
   - Verwende eine etablierte FTP-Deploy-Action (z.B. `SamKirkland/FTP-Deploy-Action`).
   - Ziel-Verzeichnis auf Hostgator: in der Regel `public_html/` (bzw. der Domain-Ordner, falls als Addon-Domain eingerichtet).
4. **Secrets**, die der Betreiber im GitHub-Repo unter Settings → Secrets and variables → Actions hinterlegen muss (du dokumentierst das, trägst sie nicht selbst ein):
   - `FTP_SERVER` (FTP-Host aus Hostgator cPanel)
   - `FTP_USERNAME`
   - `FTP_PASSWORD`
5. **Schritt-für-Schritt-Anleitung** für den Betreiber schreiben: wo er in cPanel die FTP-Zugangsdaten findet, wie er die Secrets setzt, wie der erste Deploy ausgelöst wird, wie er prüft, dass die Seite live ist.

> Hinweis für den Betreiber: Wenn du FTP-Zugangsdaten brauchst, erstellst du die selbst in Hostgator cPanel. Trag Passwörter niemals in den Code oder ins Repo ein, nur als GitHub-Secrets.

## 9. SEO

- Saubere Meta-Titles/Descriptions je Seite, sprechende URLs (z.B. `/mindestsicherung-wien/`).
- Strukturierte Daten: FAQPage-Schema beim FAQ, ggf. passend für Rechner/HowTo.
- Sitemap (Astro-Integration), `robots.txt`, semantisches HTML.
- Interne Verlinkung zwischen Hauptseite, Bundesländer-Seiten, FAQ, Rechner.
- Schnelle Ladezeit als Rankingfaktor (passt zum statischen Stack).

## 10. Monetarisierung (nur Platzhalter im Code)

Nicht zuspammen. Werbung dezent und klar vom Inhalt getrennt.

- Reservierte, dezente **AdSense-Slots** als eigene Komponente (zunächst leerer Platzhalter, wird später mit dem AdSense-Code befüllt).
- Eine dezente **"Das könnte dir auch helfen"-Sektion** als Affiliate-Platzhalter-Komponente.
- Cookie-Consent/CMP-Banner vorbereiten (für AdSense in der EU verpflichtend), zunächst als einbindbare Komponente.

## 11. Pflicht: Rechtliches

- Gut sichtbarer **Disclaimer** bei jedem Rechner-Ergebnis und im Footer: "Unverbindliche Orientierung, keine Rechts- oder Sozialberatung."
- **Impressum** (nach §5 ECG) und **Datenschutzerklärung** (DSGVO) als Seiten anlegen, Inhalt füllt der Betreiber.
- Bei AdSense/Tracking: Cookie-Consent-Banner ist Pflicht.

## 12. Arbeitsweise

- Frag bei größeren Architektur-Entscheidungen kurz nach, statt einfach drauflos.
- Erklär wichtige Schritte knapp (Betreiber ist Designer, kein Backend-Profi).
- Code übersichtlich und kommentiert halten, vor allem die zentrale Sätze-Datei.
- Starte mit dem MVP-Scope (Abschnitt 3), zeig das Ergebnis, dann skalieren.
