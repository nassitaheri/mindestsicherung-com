# Bundesland-Seiten-Vorlage (mindestsicherung.com)

**Zweck:** Wiederverwendbares Gerüst für jede Bundesland-Seite. Sichert konsistente Struktur, SEO-Hygiene, E-E-A-T-Signale und schützt gegen Duplicate Content. Platzhalter in `[eckigen Klammern]` pro Land ersetzen.

---

## 1. URL-Schema

```
/mindestsicherung-[land]/        z.B. /mindestsicherung-wien/
```

- Kleinschreibung, Bindestrich, keine Umlaute (Niederösterreich → `niederoesterreich`).
- Sammelseite als Eltern: `/bundeslaender/` (verlinkt alle Länder, zeigt Status).

---

## 2. Title & Meta

- **Title** (Ziel 55 bis 60 Zeichen):
  `Mindestsicherung [Land] 2026: Höhe & Antrag | mindestsicherung.com`
- **Meta Description** (Ziel 150 bis 160 Zeichen):
  `Wie viel Mindestsicherung steht dir in [Land] 2026 zu? Aktuelle Sätze, Anspruch und Antrag. In 2 Minuten berechnen, ohne Anmeldung.`
- **Jahr immer in Title, H1 und Description.** Frische-Signal und matcht die Suchanfragen.

---

## 3. Heading-Hierarchie (genau diese Reihenfolge)

```
H1  Mindestsicherung [Land] 2026: Höhe, Anspruch & Antrag
    └ Intro: 2 bis 3 Sätze, beantwortet sofort "wie viel + für wen", mit Stand-Datum
    └ Rechner-CTA-Block (Land vorausgewählt verlinken)

H2  Wie hoch ist die Mindestsicherung in [Land] 2026?
    └ Tabelle mit Sätzen + Hinweis "Höchstsätze, individuell abhängig von Haushalt/Wohnkosten/Einkommen"

H2  Wer hat Anspruch in [Land]?
    └ Voraussetzungen, land-spezifische Punkte

H2  Besonderheiten & Änderungen 2026 in [Land]      ← PFLICHT-UNIKAT (siehe Punkt 5)

H2  Mindestsicherung in [Land] beantragen
    └ Zuständige Stelle (Name + Link), Unterlagen, Ablauf

H2  Auszahlung & Termine in [Land]

H2  Häufige Fragen ([Land])
    └ 3 bis 5 land-spezifische Q&A (speisen das FAQ-Schema)

E-E-A-T-Footer (Punkt 6)
```

---

## 4. Pflicht-Content-Sektionen

Jede Landesseite enthält mindestens:

- **Sätze-Tabelle** (aktuelle Höchstsätze + land-spezifische Zuschläge/Wohnzuschüsse)
- **Zuständige Behörde** mit Name, Link, ggf. Online-Antrag
- **Besonderheiten 2026** (das unterscheidet die Seite inhaltlich von allen anderen Ländern)
- **Antrags-Ablauf** (Schritt für Schritt)
- **3 bis 5 Land-FAQ**

---

## 5. Duplicate-Content-Schutz (wichtig)

Das Risiko: neun fast identische Landesseiten. Google wertet das ab.

**Regel: Mindestens diese Felder sind pro Land einzigartig formuliert, nicht aus einer Vorlage kopiert:**

- Einleitungs-Absatz (eigene Formulierung, eigene Zahlen)
- Abschnitt "Besonderheiten & Änderungen 2026"
- Zuständige Stelle + Antragsweg
- Die FAQ-Antworten

**Faustregel:** Wenn du eine Landesseite neben eine andere legst, müssen sich mindestens 40 Prozent des Fließtexts unterscheiden. Boilerplate (Disclaimer, Begriffserklärung) darf identisch sein, der Kern nicht.

---

## 6. E-E-A-T-Footer (auf jeder Seite identischer Aufbau)

```
Stand: [TT. Monat JJJJ] · Zuletzt aktualisiert: [TT. Monat JJJJ]

Quellen:
- [Offizielle Landesseite] (Link)
- Sozialministerium (Link)
- Arbeiterkammer [Land] (Link)

Autor: [Echter Name], [kurze Rolle/Qualifikation] · Über uns (Link)

Hinweis: mindestsicherung.com ist ein unabhängiges, privates Informationsangebot
und keine Behörde. Die Berechnung ist eine Orientierung, ohne Gewähr und ohne
Rechtsberatung. Verbindlich ist allein der Bescheid der zuständigen Stelle.
```

- **Echter Name als Autor**, nicht "Redaktion". Stärkstes E-E-A-T-Signal, das dir fehlt.
- Disclaimer **auch direkt beim Rechner-Ergebnis**, nicht nur im Footer.

---

## 7. JSON-LD (copy-paste, Platzhalter ersetzen)

In den `<head>` der Landesseite. `dateModified` ist dein Frische-Hebel, bei jedem Update mitziehen.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type":"ListItem","position":1,"name":"Start","item":"https://mindestsicherung.com/"},
        {"@type":"ListItem","position":2,"name":"Bundesländer","item":"https://mindestsicherung.com/bundeslaender/"},
        {"@type":"ListItem","position":3,"name":"[Land]","item":"https://mindestsicherung.com/mindestsicherung-[land]/"}
      ]
    },
    {
      "@type": "Article",
      "headline": "Mindestsicherung [Land] 2026: Höhe, Anspruch & Antrag",
      "description": "Aktuelle Sätze, Anspruch und Antrag der Mindestsicherung in [Land] 2026.",
      "datePublished": "2026-01-15",
      "dateModified": "2026-06-15",
      "inLanguage": "de-AT",
      "author": {
        "@type": "Person",
        "name": "[Echter Name]",
        "url": "https://mindestsicherung.com/ueber-uns/"
      },
      "publisher": {
        "@type": "Organization",
        "name": "mindestsicherung.com",
        "logo": {"@type":"ImageObject","url":"https://mindestsicherung.com/logo.png"}
      },
      "mainEntityOfPage": "https://mindestsicherung.com/mindestsicherung-[land]/"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Wie hoch ist die Mindestsicherung in [Land] 2026?",
          "acceptedAnswer": {"@type":"Answer","text":"[Kurze, konkrete Antwort mit Betrag.]"}
        },
        {
          "@type": "Question",
          "name": "Wo beantrage ich die Mindestsicherung in [Land]?",
          "acceptedAnswer": {"@type":"Answer","text":"[Zuständige Stelle nennen.]"}
        }
      ]
    }
  ]
}
</script>
```

**Ehrlicher Hinweis zum FAQ-Schema:** Google zeigt FAQ-Rich-Results seit 2023 fast nur noch für Behörden und große Gesundheitsseiten an. Du bekommst damit also wahrscheinlich keine Rich Snippets, aber das Markup ist valide und schadet nicht. **Dein echter Frische-Hebel ist `dateModified` im Article-Block.**

**Rechner-Seite (separat, nicht Landesseite):** dort zusätzlich `WebApplication` oder `HowTo` erwägen.

---

## 8. Interne Verlinkung (Pflicht pro Landesseite)

- Eingehend: von `/bundeslaender/` und von der Startseite.
- Ausgehend: zum **Rechner** (Land vorausgewählt), zur **Antrag**-Ratgeberseite, zu **Auszahlungstermine**.
- 1 bis 2 Links zu thematisch nahen Landesseiten (z.B. Nachbarbundesland), natürlich im Text.

---

## 9. Pre-Flight-Checkliste vor Publish

- [ ] Sätze stimmen mit offizieller Quelle (Stand-Datum gesetzt)
- [ ] Abschnitt "Besonderheiten 2026" ist land-spezifisch und einzigartig
- [ ] Title, H1, URL enthalten Land + Jahr
- [ ] Meta Description gesetzt, 150 bis 160 Zeichen
- [ ] Interner Link von `/bundeslaender/` und Link zum Rechner vorhanden
- [ ] Quellen verlinkt (offiziell)
- [ ] Disclaimer sichtbar beim Rechner-Ergebnis
- [ ] JSON-LD im Rich Results Test validiert
- [ ] `datePublished` und `dateModified` korrekt
- [ ] Autor mit echtem Namen + Link zu "Über uns"

---

## 10. Status-Logik für unfertige Länder

Solange eine Landesseite nicht vollständig ist:

- **Nicht** als Thin-Content-Platzhalter live lassen.
- Entweder erst publishen wenn vollständig, oder per `noindex` aus dem Index halten.
- Auf `/bundeslaender/` ehrlich "in Arbeit" markieren, ohne tote Detailseite.
