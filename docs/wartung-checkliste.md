# Jährliche Wartungs-Checkliste + Quell-Liste (mindestsicherung.com)

**Warum das existiert:** Die Sätze ändern sich jährlich, einzelne Länder auch unterjährig. Veraltete Zahlen schaden Nutzern und killen Rankings. Bei schwachem Arbeitsgedächtnis gilt: System statt Kopf. Diese Datei ist das System.

---

## Wann auslösen

- **Jährlich, fix:** Mitte Dezember bis Mitte Jänner (neue Valorisierung tritt zum 1. Jänner in Kraft). Kalender-Reminder jetzt setzen, wiederkehrend.
- **Ad-hoc:** Sobald ein Land eine Reform beschließt. Quellen unten lose beobachten, besonders 2027 (geplante bundesweite Reform).

---

## Jährlicher Ablauf (Schritt für Schritt)

1. **Bundeswerte holen** (Sozialministerium): Höchstsätze, Vermögensfreibetrag, Pflicht-Zuschläge.
2. **Pro Bundesland** offizielle Landeswerte prüfen: Abweichungen, Wohnzuschüsse, neue Sanktionen/Sonderregeln.
3. **Rechner-Logik updaten:** Werte und Jahr eintragen. Dann mit 2 bis 3 Testfällen gegen offizielle Berechnungsbeispiele gegenprüfen.
4. **Jahreszahl überall ersetzen:** Titles, Meta, H1, Fließtext, JSON-LD `headline`. Volltextsuche im Repo nach altem Jahr (z.B. `2026`) verhindert Übersehenes.
5. **Stand-Datum + `dateModified`** auf jeder geänderten Seite aktualisieren.
6. **Tabellen aktualisieren** (Sätze-Tabellen auf allen Landesseiten).
7. **"Änderungen [Jahr]"-Seite** neu schreiben oder aktualisieren. Fängt aktuelle News-Suchen ab und ist starkes Frische-Signal.
8. **Sitemap `lastmod`** ziehen, in der Search Console Indexierung und Fehler prüfen.
9. **Sichtprüfung Rechner** auf Live-Site mit einem echten Beispiel pro Land.

---

## Anker-Werte 2026 (zum Sofort-Gegencheck)

Bundesweite Höchstsätze und Eckwerte, Stand Jänner 2026. **Länder können abweichen und aufstocken**, also nur als Orientierung und Plausibilitätscheck, nicht als Endwert.

| Konstellation | Wert 2026 |
|---|---|
| Alleinstehende / Alleinerziehende (Höchstsatz) | 1.229,89 € |
| Paare (gesamt) | 1.721,85 € |
| 70 % (z.B. 2. Erwachsener in Bedarfsgemeinschaft) | 860,92 € |
| 45 % (ab 3. volljähriger Person) | 553,45 € |
| Vermögensfreibetrag pro volljährige Person | 7.379,34 € |
| Pflicht-Zuschlag Menschen mit Behinderung | rund 221 € |
| Zuschlag Alleinerziehende, 1. Kind | rund 148 € |
| Zuschlag Alleinerziehende, ab 4. Kind | rund 37 € |
| Land-Mindestbetrag (20 % Ausgleichszulagenrichtsatz) | bis zu 246 € |
| Auszahlung | 12x jährlich |

Systemlogik seit dem Sozialhilfe-Grundsatzgesetz 2019: **Höchstsätze statt garantierter Mindeststandards**. Die VfGH-Aufhebung 2019 (Kinder-Höchstsätze, B1-Sprachkopplung) bedeutet, dass Länder Kinderbeträge frei festlegen. Quervergleich pro Land daher Pflicht.

---

## Wien 2026, konkret (deine wichtigste Seite zuerst verifizieren)

- **Aufteilung einheitlich:** 75 % Lebensunterhalt, 25 % Wohnbedarf (wirkt auf die Mietbeihilfe).
- **Junge Erwachsene unter 25:** erhöhter Mindeststandard nur bei Schul- oder Erwerbsausbildung oder Beschäftigung über der Geringfügigkeitsgrenze.
- **Sonderzahlung (April/Oktober)** für arbeitsunfähige Personen und Personen im Regelpensionsalter: halbiert.
- **Elternzuschlag** für minderjährige Kinder (rund 54 € pro Monat und Elternteil): entfällt.
- **subsidiär Schutzberechtigte:** kein Mindestsicherungs-Anspruch mehr, fallen in die Grundversorgung.

Prüfe, ob dein Wien-Rechner diese fünf Punkte bereits korrekt abbildet. Wenn nicht, ist das ein Korrektheits- und Haftungsrisiko, nicht nur ein SEO-Thema.

---

## Quell-Liste (priorisiert)

**Primär, bundesweit (immer zuerst):**
- Sozialministerium, Leistungen: `https://www.sozialministerium.gv.at/Themen/Soziales/Sozialhilfe-und-Mindestsicherung/Leistungen.html`
- Sozialministerium, Übersicht: `https://www.sozialministerium.gv.at/Themen/Soziales/Sozialhilfe-und-Mindestsicherung.html`
- oesterreich.gv.at (amtliches Bürgerportal)

**Erklärung & Gegencheck (gut für Plausibilität, nicht als Hauptquelle zitieren):**
- Arbeiterkammer des jeweiligen Landes (`*.arbeiterkammer.at`)

**Pro Bundesland, offizielle Landesseite (Hauptquelle für Landeswerte):**
- Wien: `wien.gv.at` (Suche "Wiener Mindestsicherung")
- Tirol: Land Tirol bzw. `mindestsicherungtirol.at`
- Übrige Länder: offizielle Landesregierungsseite, Suchmuster `[Land] Sozialhilfe Höhe [Jahr] site:gv.at`

**Nicht als Quelle zitieren (Konkurrenz, nur zum Markt-Vergleich):**
- finanz.at, finfo.at, finrechner.at, mindestsicherungsrechner.at, bam-magazin.at, ganz-wien.at

**Begriffs-Hinweis fürs Tracking:** Je nach Land heißt die Leistung Mindestsicherung, Sozialhilfe oder Sozialunterstützung. Wien bleibt vorerst bei "Mindestsicherung". Die bundesweite Reform ist für 2027 geplant, ab dann kann sich die Terminologie verschieben.

---

## Ablage & Reminder

- Diese Datei im Repo unter `/docs/` versionieren, damit jede Änderung nachvollziehbar ist.
- Wiederkehrenden Kalender-Eintrag "Mindestsicherung-Sätze aktualisieren" für jeden Dezember anlegen.
- Optional: kurze `CHANGELOG`-Zeile pro Jahr im Repo, was wann auf welchen Wert geändert wurde. Hilft beim nächsten Durchlauf.
