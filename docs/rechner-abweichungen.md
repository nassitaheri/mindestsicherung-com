# Rechner-Gegencheck: Abweichungen 2026

**Erstellt:** 15. Juni 2026 · **Geprüft gegen:** `docs/wartung-checkliste.md` (Anker-Werte 2026 + Wien-Änderungen) und `docs/bundesland-seiten-vorlage.md`.

> **Wichtig:** In diesem Durchgang wurden **keine Beträge und keine Rechenregeln geändert.** Diese Datei listet nur, wo die aktuelle Logik (`src/lib/calc.ts` + `src/data/saetze-2026.ts`) von den 2026-Vorgaben abweicht, damit du jede Abweichung gegen die **offizielle Quelle** prüfst und selbst entscheidest, ob/wie der Rechner angepasst wird.

Quelle der Wahrheit für jede Korrektur: **Stadt Wien / MA 40** und **Sozialministerium** (Links in `wartung-checkliste.md`). Konkurrenz-Rechner sind nicht als Quelle zulässig.

---

## Update 15. Juni 2026 — Golden-Tests, CI & die Fixes A/B/C

Seit diesem Durchgang ist der Rechner maschinell abgesichert:

- **Regel-Datei als Quelle der Wahrheit:** `src/lib/rules/wien-2026.json` (aus `docs/seed/wien-2026-seed.json`). Die Rechenlogik (`src/lib/calc.ts`, Funktion `berechneMitRegeln`) enthält **keine hartcodierten Beträge** mehr — jeder Wert kommt aus dieser Datei.
- **Golden-Master-Tests** (`src/lib/__tests__/wien-2026.golden.test.ts`) + **CI** (`.github/workflows/test.yml`): `npm test` läuft bei jedem Push/PR. Rot = Merge/Deploy gestoppt.
- **Rundungsregel dokumentiert:** Wien-Alleinstehend = Komponentensumme **1.229,88 €** (922,41 + 307,47) ist für den Wien-Rechner verbindlich, **nicht** der gerundete Bundes-Höchstsatz 1.229,89 €. `saetze-2026.ts` wurde entsprechend auf 1.229,88 korrigiert (mit Kommentar).

Stand der drei Korrektheits-Punkte:

| Punkt | Vorher | Jetzt |
|---|---|---|
| **A** subsidiär | nur Text-Hinweis | **in der Logik umgesetzt** (harter Ausschluss) + Checkbox in der Wien-UI. Aktiver Test grün. |
| **B** Erwerbstätigenfreibetrag | 1:1-Abzug, kein Mechanismus | **Mechanik verdrahtet**, liest `erwerbstaetigenfreibetrag` aus der Regel-Datei. Wert noch `null` → konservativ 1:1 **plus sichtbarer Hinweis**. Richtung per aktivem Mechanik-Test gesichert, exakter Wert als `it.todo`. |
| **C** unter-25 reduziert | voller Satz | **Mechanik verdrahtet**, liest `unter25_reduzierter_satz_ohne_ausbildung`. Wert noch `null` → voller Satz **plus Hinweis**. Richtung per Test gesichert, exakter Wert als `it.todo`. |

> Wichtig: A wirkt **sofort** (kein erfundener Betrag nötig — es ist eine Ja/Nein-Regel). B und C bleiben in der Auszahlhöhe bewusst **konservativ/unverändert**, bis die offiziellen Werte vorliegen (siehe Abschnitt „Offene offizielle Werte"). Es wurde **kein Betrag geraten.**

---

## Zusammenfassung

| # | Abweichung | Richtung | Schweregrad |
|---|---|---|---|
| A | Subsidiär Schutzberechtigte werden in der Logik nicht ausgeschlossen | Überschätzung / Fehlanspruch | **Korrektheit/Haftung** |
| B | Erwerbseinkommens-Freibetrag (Wien bis 20 %) fehlt — Einkommen wird 1:1 abgezogen | Unterschätzung | **Korrektheit/Haftung** |
| C | Junge Erwachsene 18–25 ohne Ausbildung/Erwerb: voller Satz statt reduziert | Überschätzung | **Korrektheit/Haftung** |
| D | Alleinerziehenden-Zuschlag (bundesweit ~148 €) nicht abgebildet, Wien-Status unklar | evtl. Unterschätzung | inhaltlich klären |
| E | 45 %-Satz ab 3. volljähriger Person fehlt (Logik nimmt 70 %) | derzeit ohne Zahleneffekt (Deckel maskiert) | latent |
| F | Paar-Summe 1.721,84 € statt offiziell 1.721,85 € | −1 Cent | kosmetisch |
| G | Sonderzahlung April/Oktober (halbiert) nicht abgebildet | außerhalb Monatslogik | dokumentiert |
| H | 75/25-Aufteilung Lebensunterhalt/Wohnbedarf + Mietbeihilfe nicht abgebildet | außerhalb Scope | dokumentiert |

**Korrekt abgebildet (kein Handlungsbedarf):** Höchstsatz Alleinstehend 1.229,89 € · Gemeinschaft 70 % 860,92 € · Vermögensfreibetrag 7.379,34 €/Person · 175 %-Deckel 2.152,31 € · Behindertenzuschlag 221,38 € · Kind Wien flach 332,07 € · Elternzuschlag korrekt **nicht** enthalten (per 31.12.2025 gestrichen).

---

## A — Subsidiär Schutzberechtigte werden nicht ausgeschlossen

**Vorgabe (Wien 2026):** Subsidiär Schutzberechtigte haben **keinen Mindestsicherungs-Anspruch mehr**, sie fallen in die Grundversorgung.

**Ist-Zustand:** `calc.ts` kennt kein Status-Feld. Für diese Personen rechnet der Rechner einen normalen Anspruch und zeigt einen positiven Auszahlbetrag. Der Ausschluss steht nur als **Text-Hinweis** in `saetze-2026.ts` (`WIEN.hinweise`), wird aber **nicht in der Logik** erzwungen.

**Wirkung:** Überschätzung bzw. fälschlich angezeigter Anspruch für eine klar ausgeschlossene Gruppe → Korrektheits- und Haftungsrisiko.

**Möglicher Fix (nach deiner Quellenprüfung):** Checkbox „subsidiär schutzberechtigt" → bei `true` Ergebnis auf „kein Anspruch (Grundversorgung)" setzen.

---

## B — Erwerbseinkommens-Freibetrag fehlt (Einkommen wird 1:1 abgezogen)

**Vorgabe:** In Wien bleibt ein Teil des Erwerbseinkommens anrechnungsfrei (laut unserer eigenen FAQ derzeit **bis zu 20 %**), um Erwerbstätigkeit zu fördern.

**Ist-Zustand:** `calc.ts` zieht das eingegebene Einkommen **voll** vom Gesamtbedarf ab:

```
// calc.ts
const nachEinkommen = gesamtbedarf - einkommen;   // 1:1, kein Freibetrag
```

Der Wert `geringfuegigkeitsgrenze_monat: 551.10` existiert in `saetze-2026.ts`, wird in der Logik aber **nicht verwendet**.

**Wirkung:** **Unterschätzung** des Auszahlbetrags bei allen Haushalten mit Erwerbseinkommen — betrifft viele reale Fälle.

**Vor dem Fix klären:** exakte Freibetragsregel der MA 40 (Prozentsatz, Deckel, ob nur Erwerbs- vs. Ersatzeinkommen). Erst dann Logik ergänzen, sonst tauscht man eine ungenaue Zahl gegen eine andere.

---

## C — Junge Erwachsene 18–25 ohne Ausbildung/Erwerb

**Vorgabe (Wien 2026):** Der erhöhte Mindeststandard für unter 25-Jährige gilt **nur** bei Schul-/Erwerbsausbildung oder Beschäftigung über der Geringfügigkeitsgrenze.

**Ist-Zustand:** `calc.ts` hat kein Altersfeld und keinen Ausbildungs-/Erwerbsstatus. Eine alleinstehende Person unter 25 erhält immer den vollen Satz (1.229,89 €).

**Wirkung:** Überschätzung für unter-25-Jährige ohne Ausbildung/Erwerb.

**Möglicher Fix:** optionales Feld „18–24 Jahre" + „in Ausbildung/Beschäftigung?"; bei Nein reduzierten Standard ansetzen — **Höhe vorher offiziell verifizieren.**

---

## D — Alleinerziehenden-Zuschlag nicht abgebildet (Wien-Status unklar)

**Vorgabe (bundesweiter Ankerwert):** Zuschlag Alleinerziehende, 1. Kind **~148 €**, gestaffelt bis ab 4. Kind ~37 €.

**Ist-Zustand:** `calc.ts` behandelt `alleinerziehend` faktisch wie `alleinstehend` (voller Satz) **plus** flache Kindersätze — **kein** Alleinerziehenden-Zuschlag.

**Zu klären:** Gewährt **Wien** diesen Zuschlag 2026? In unseren eigenen Materialien gibt es eine mögliche Verwechslung mit dem **gestrichenen Elternzuschlag** (~54 €). `wartung-checkliste.md` listet für Wien nur die Streichung des Elternzuschlags, der ~148-€-Zuschlag ist ein **bundesweiter** Ankerwert. → **Gegen offizielle Wiener Quelle prüfen**, bevor irgendetwas ergänzt wird.

**Wirkung falls Wien ihn gewährt:** Unterschätzung für Alleinerziehende.

---

## E — 45 %-Satz ab 3. volljähriger Person fehlt (derzeit maskiert)

**Vorgabe (Ankerwert):** ab der 3. volljährigen Person 45 % = **553,45 €**.

**Ist-Zustand:** `calc.ts` gibt in `paar`/`wg` **jedem** Erwachsenen 70 % (860,92 €):

```
// calc.ts
erwachsenenBedarf = saetze.gemeinschaft * erwachsene;   // 70 % je Person, auch ab der 3.
```

**Warum aktuell kein Zahleneffekt:** Ab 3 Erwachsenen greift in beiden Modellen der **175 %-Deckel (2.152,31 €)**:
- 70 %-Modell: 3 × 860,92 = 2.582,76 → gedeckelt auf 2.152,31
- 45 %-Modell: 860,92 + 860,92 + 553,45 = 2.275,29 → ebenfalls gedeckelt auf 2.152,31

Beide landen identisch beim Deckel. Die Lücke ist also **latent** und würde erst relevant, wenn sich Sätze oder Deckel ändern.

**Empfehlung:** notieren, aber niedrige Priorität.

---

## F — Paar-Summe um 1 Cent niedriger

**Vorgabe:** Paar gesamt = **1.721,85 €** (140 % Richtsatz).

**Ist-Zustand:** `calc.ts` rechnet Paar = 2 × 70 % = 2 × 860,92 = **1.721,84 €**. Rundungsdifferenz, weil 70 % einzeln gerundet wird (1.229,89 × 0,7 = 860,923 → 860,92), ×2 ergibt 1.721,84.

**Wirkung:** −1 Cent, rein kosmetisch.

**Möglicher Fix:** Paar-Bedarf direkt aus `paar_140 = 1721.85` ziehen statt 2 × 70 %.

---

## G — Sonderzahlung April/Oktober (halbiert) nicht abgebildet

**Vorgabe (Wien 2026):** Sonderzahlung im April/Oktober für arbeitsunfähige Personen und Personen im Regelpensionsalter — **halbiert**.

**Ist-Zustand:** Der Rechner ist eine reine **Monatsbetrachtung** und kennt keine Jahres-Sonderzahlungen.

**Bewertung:** außerhalb des aktuellen Scopes (Monatsschätzung). Falls gewünscht, separat als Jahres-Hinweis ergänzen — kein Fehler in der Monatslogik.

---

## H — 75/25-Aufteilung & Mietbeihilfe nicht abgebildet

**Vorgabe (Wien 2026):** Leistung wird einheitlich in 75 % Lebensunterhalt / 25 % Wohnbedarf aufgeteilt; der Wohnanteil wirkt auf die Mietbeihilfe.

**Ist-Zustand:** Der Rechner zeigt die Geldleistung gesamt und weist **ausdrücklich** aus, dass die **Mietbeihilfe separat** ist (Hinweis in `saetze-2026.ts` und auf der Wien-Seite).

**Bewertung:** bewusst außerhalb des Scopes und bereits transparent disclaimt. Kein Handlungsbedarf, außer du willst die Mietbeihilfe künftig modellieren.

---

## Offene offizielle Werte (NEEDS_OFFICIAL_VALUE)

Diese zwei Werte fehlen, um die `it.todo`-Golden-Tests in echte Cent-genaue Tests zu verwandeln. **Nicht raten** — aus offizieller Quelle holen oder von AK/Sozialberatung Wien bestätigen lassen. In `src/lib/rules/wien-2026.json` stehen beide auf `null` mit `status: "NEEDS_OFFICIAL_VALUE"`.

| Schlüssel in `wien-2026.json` | Was genau gebraucht wird | Primärquelle | Gegencheck |
|---|---|---|---|
| `erwerbstaetigenfreibetrag` | Anrechnungsfreier **Anteil** des Erwerbseinkommens (als Bruch 0..1, z.B. 0,20 = 20 %). Klären: gibt es einen **Deckel** und gilt er nur für Erwerbs- (nicht Ersatz-)Einkommen? | **RIS — Wiener Mindestsicherungsgesetz (WMG)**, geltende Fassung: `https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=LrW&Gesetzesnummer=20000246` | **MA 40** (`https://sozialinfo.wien.at`), AK Wien |
| `unter25_reduzierter_satz_ohne_ausbildung` | **Absoluter EUR-Betrag** des reduzierten Mindeststandards für 18–25 ohne Schul-/Erwerbsausbildung und ohne Beschäftigung über der Geringfügigkeitsgrenze. | **RIS — WMG** (Mindeststandards/Altersstaffel) | **MA 40**, AK Wien |

**Achtung Verwechslungsgefahr beim Freibetrag (B):** *nicht* mit dem deutschen Bürgergeld-Freibetrag (20/30/10 %) und *nicht* mit dem „Land-Mindestbetrag" (20 % des Ausgleichszulagenrichtsatzes) verwechseln. Das sind drei verschiedene Dinge.

**Wenn ein Wert bestätigt ist:**
1. Wert in `src/lib/rules/wien-2026.json` eintragen, `status` und `quelle` aktualisieren.
2. Der **Stolperdraht-Test** in `wien-2026.golden.test.ts` wird dann absichtlich rot („offene Werte bleiben null") — das ist das Signal:
3. Den zugehörigen `it.todo` durch einen echten, Cent-genauen Test ersetzen (Erwartungswert aus dem offiziellen Berechnungsbeispiel).
4. `STAND.datum` / `dateModified` auf den betroffenen Seiten mitziehen (siehe `wartung-checkliste.md`).

### Kleiner Cousin: F (1-Cent-Rundung) — durch Entscheidung erledigt
Die frühere Abweichung F (Paar 1.721,84 € vs. Bundeswert 1.721,85 €) ist mit der dokumentierten **Rundungsregel** vom Tisch: Für den Wien-Rechner gilt durchgängig die Komponentensumme (Alleinstehend 1.229,88 €, Paar 2 × 70 % = 1.721,84 €). Die Seed bestätigt 1.721,84 € als Erwartungswert.

---

## Nächste Schritte (für dich)

1. **A, B, C zuerst** gegen MA 40 / Sozialministerium prüfen — das sind die Korrektheits-/Haftungspunkte.
2. **D** klären: gewährt Wien 2026 den Alleinerziehenden-Zuschlag oder nicht?
3. **E, F** nur notieren (niedrige Priorität).
4. **G, H** bewusst als „nicht im Rechner" belassen oder als separates Feature planen.
5. Nach jeder bestätigten Korrektur: Wert in `src/data/saetze-2026.ts` bzw. Logik in `src/lib/calc.ts`, dann `STAND.datum` und `dateModified` auf den Landesseiten mitziehen (siehe `wartung-checkliste.md`).
