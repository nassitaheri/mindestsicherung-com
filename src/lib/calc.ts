/**
 * ============================================================================
 *  RECHENLOGIK — Mindestsicherung / Sozialhilfe
 * ============================================================================
 *
 *  Reine Funktion: bekommt einen Haushalts-Input und gibt ein Ergebnis zurück.
 *  Kein DOM, kein State, kein Framework. Einfach testbar.
 *
 *  WICHTIG — Trennung von Daten und Logik:
 *    - `berechneMitRegeln(input, regeln)` ist der reine Kern. Er enthält KEINE
 *      hartcodierten Beträge. Jeder Betrag stammt aus dem `Regelsatz`.
 *    - `berechne(input)` ist ein dünner Wrapper, der für das gewählte Bundesland
 *      den passenden Regelsatz besorgt (Wien aus src/lib/rules/wien-2026.json,
 *      übrige Länder vorerst aus src/data/saetze-2026.ts) und den Kern aufruft.
 *
 *  Modell (siehe docs/wartung-checkliste.md / BRIEF.md Abschnitt 4):
 *    1. Gesamtbedarf = Summe Mindeststandards aller Haushaltsmitglieder
 *    2. Deckelung der Erwachsenen-Beträge auf 175 % Richtsatz
 *    3. Minus anrechenbares Einkommen (mit Erwerbstätigenfreibetrag, Abw. B)
 *    4. Vermögens-Check (Freibetrag pro volljähriger Person)
 *    5. Auszahlbetrag (ergänzende Mindestsicherung)
 *
 *  Geprüfte Sonderregeln 2026 (Wien):
 *    A — subsidiär Schutzberechtigte: harter Anspruchs-Ausschluss.
 *    B — Erwerbstätigenfreibetrag statt 1:1-Abzug (Wert offen → konservativ 1:1).
 *    C — 18–25 ohne Ausbildung/Erwerb: reduzierter Satz (Wert offen → voller Satz).
 * ============================================================================
 */

import { BUNDESLAENDER, BUNDESWEIT_2026, type BundeslandSlug, type Bundesland } from '../data/saetze-2026';
import { WIEN_2026, type Regelsatz } from './rules/regelsatz';

export type { Regelsatz };

export type HaushaltInput = {
  bundesland: BundeslandSlug;
  /**
   * Konstellation der Erwachsenen im Haushalt.
   *  - "alleinstehend": 1 Person, voller Satz
   *  - "alleinerziehend": 1 Person + Kinder, voller Satz (Wien: identisch)
   *  - "paar": 2 Erwachsene, je 70%
   *  - "wg": ≥2 Erwachsene in WG, je 70%
   */
  konstellation: 'alleinstehend' | 'alleinerziehend' | 'paar' | 'wg';
  /** Anzahl Erwachsene insgesamt (mind. 1). Bei "paar" automatisch 2. */
  erwachsene: number;
  /** Anzahl minderjährige Kinder im Haushalt. */
  kinder: number;
  /** Anzahl Personen mit Behindertenpass §40 BBG. */
  mitBehinderung: number;
  /** Monatliches anrechenbares Netto-Einkommen aller Haushaltsmitglieder. */
  einkommenMonat: number;
  /** Verwertbares Vermögen (Bargeld, Sparbuch, etc.) ohne Schonvermögen. */
  vermoegen: number;

  // ---- Optionale Felder für die geprüften Sonderregeln (A/B/C) -------------
  /** Abweichung A: Person(en) subsidiär schutzberechtigt? → ggf. kein Anspruch. */
  subsidiaerSchutzberechtigt?: boolean;
  /**
   * Abweichung B: Stammt das Einkommen aus Erwerbstätigkeit? Nur dann greift
   * der Erwerbstätigenfreibetrag. Default false → konservativer 1:1-Abzug.
   */
  einkommenIstErwerbstaetig?: boolean;
  /**
   * Abweichung C: Person 18–25 OHNE Schul-/Erwerbsausbildung und OHNE
   * Beschäftigung über der Geringfügigkeitsgrenze? Nur für 1-Erwachsenen-
   * Konstellationen ausgewertet.
   */
  unter25OhneAusbildung?: boolean;
};

export type Ergebnis = {
  /** Gesamtbedarf vor Einkommens-Abzug */
  gesamtbedarf: number;
  /** Anteil Erwachsene am Gesamtbedarf (für Deckelungs-Check) */
  erwachsenenBedarf: number;
  /** Anteil Kinder am Gesamtbedarf */
  kinderBedarf: number;
  /** Zusatzleistungen (Behindertenzuschlag) */
  zuschlaege: number;
  /** Wurde die 175%-Deckelung angewendet? */
  deckelungAngewendet: boolean;
  /** Anrechenbares Einkommen (nach evtl. Erwerbstätigenfreibetrag abgezogen) */
  einkommen: number;
  /** Auszahlbetrag = max(0, Gesamtbedarf − anrechenbares Einkommen) */
  auszahlbetrag: number;
  /** Vermögen über Freibetrag? → kein Anspruch */
  vermoegenUeberFreibetrag: boolean;
  vermoegensfreibetragGesamt: number;
  /** Hat der Haushalt Anspruch? */
  hatAnspruch: boolean;
  /** Klartext-Begründungen für die UI */
  hinweise: string[];
};

/**
 * Reiner Rechenkern. Liest ALLE Beträge aus `regeln` — keine Literale.
 */
export function berechneMitRegeln(input: HaushaltInput, regeln: Regelsatz): Ergebnis {
  const hinweise: string[] = [];

  // ---- Abweichung A: subsidiär Schutzberechtigte ----------------------------
  // Harter Ausschluss, bevor überhaupt gerechnet wird.
  if (input.subsidiaerSchutzberechtigt && !regeln.subsidiaerHatAnspruch) {
    return {
      gesamtbedarf: 0,
      erwachsenenBedarf: 0,
      kinderBedarf: 0,
      zuschlaege: 0,
      deckelungAngewendet: false,
      einkommen: 0,
      auszahlbetrag: 0,
      vermoegenUeberFreibetrag: false,
      vermoegensfreibetragGesamt: 0,
      hatAnspruch: false,
      hinweise: [
        'Subsidiär Schutzberechtigte haben seit 1.1.2026 keinen Anspruch auf die Wiener Mindestsicherung. Zuständig ist die Grundversorgung.',
      ],
    };
  }

  // ---- 1. Erwachsenen-Bedarf -------------------------------------------------
  let erwachsene = Math.max(1, Math.floor(input.erwachsene));
  if (input.konstellation === 'paar') erwachsene = 2;

  let erwachsenenBedarf = 0;
  if (input.konstellation === 'alleinstehend' || input.konstellation === 'alleinerziehend') {
    // Einzelne Person mit vollem Satz — außer Abweichung C greift.
    if (input.unter25OhneAusbildung) {
      if (regeln.unter25ReduzierterSatz !== null) {
        erwachsenenBedarf = regeln.unter25ReduzierterSatz;
      } else {
        // Wert noch nicht offiziell verifiziert → voller Satz, aber sichtbarer TODO-Hinweis.
        erwachsenenBedarf = regeln.alleinstehend;
        hinweise.push(
          'Für junge Erwachsene (18–25) ohne Ausbildung oder Beschäftigung gilt ein reduzierter Mindeststandard. Der exakte Wiener Betrag ist noch nicht offiziell hinterlegt — der Rechner zeigt vorerst den vollen Satz, das tatsächliche Ergebnis kann niedriger ausfallen. (offen, Quelle: WMG/MA 40)',
        );
      }
    } else {
      erwachsenenBedarf = regeln.alleinstehend;
    }
  } else {
    // Paar oder WG: jeder Erwachsene erhält den Gemeinschafts-Satz (70 %).
    erwachsenenBedarf = regeln.gemeinschaft70 * erwachsene;
  }

  // ---- 2. Deckelung Erwachsene (175 %) --------------------------------------
  let deckelungAngewendet = false;
  if (erwachsenenBedarf > regeln.deckel175) {
    erwachsenenBedarf = regeln.deckel175;
    deckelungAngewendet = true;
    hinweise.push(
      `Die Summe für die Erwachsenen wurde auf den Höchstbetrag von ${euro(regeln.deckel175)} gedeckelt (175 % des Richtsatzes).`,
    );
  }

  // ---- 3. Kinder-Bedarf ------------------------------------------------------
  const kinder = Math.max(0, Math.floor(input.kinder));
  const kinderBedarf = kinder * regeln.kindFlach;

  // ---- 4. Zuschläge ---------------------------------------------------------
  const mitBehinderung = Math.max(0, Math.floor(input.mitBehinderung));
  const zuschlaege = mitBehinderung * regeln.behindertenzuschlag;

  // ---- 5. Gesamtbedarf ------------------------------------------------------
  const gesamtbedarf = round2(erwachsenenBedarf + kinderBedarf + zuschlaege);

  // ---- 6. Einkommen abziehen (Abweichung B: Erwerbstätigenfreibetrag) -------
  const einkommen = Math.max(0, input.einkommenMonat);
  let anrechenbar = einkommen; // Default: 1:1-Abzug (konservativ)

  if (input.einkommenIstErwerbstaetig && einkommen > 0) {
    if (regeln.erwerbstaetigenfreibetrag !== null) {
      // Freibetrag ist ein anrechnungsfreier Anteil (0..1) des Erwerbseinkommens.
      const freibetrag = round2(einkommen * regeln.erwerbstaetigenfreibetrag);
      anrechenbar = round2(einkommen - freibetrag);
    } else {
      // Wert offen → konservativ ohne Freibetrag, aber TODO sichtbar machen.
      hinweise.push(
        'Auf Erwerbseinkommen ist in Wien ein Freibetrag vorgesehen (ein Teil bleibt anrechnungsfrei). Der exakte Wiener Wert ist noch nicht offiziell verifiziert — der Rechner rechnet derzeit konservativ ohne Freibetrag, das tatsächliche Ergebnis kann höher ausfallen. (offen, Quelle: WMG/MA 40)',
      );
    }
  }

  const nachEinkommen = gesamtbedarf - anrechenbar;
  const auszahlbetrag = round2(Math.max(0, nachEinkommen));

  if (anrechenbar >= gesamtbedarf) {
    hinweise.push(
      'Das anrechenbare Einkommen erreicht oder überschreitet den Gesamtbedarf — es besteht kein Anspruch auf ergänzende Mindestsicherung.',
    );
  }

  // ---- 7. Vermögens-Check ---------------------------------------------------
  const vermoegensfreibetragGesamt = round2(erwachsene * regeln.vermoegensfreibetragProPerson);
  const vermoegenUeberFreibetrag = input.vermoegen > vermoegensfreibetragGesamt;
  if (vermoegenUeberFreibetrag) {
    hinweise.push(
      `Das angegebene Vermögen liegt über dem Freibetrag von ${euro(vermoegensfreibetragGesamt)} (${euro(regeln.vermoegensfreibetragProPerson)} pro volljähriger Person). Ersparnisse müssen grundsätzlich zuerst verbraucht werden. Ausnahmen: selbst bewohnte Eigentumswohnung, berufs- oder behinderungsbedingt notwendiges Auto, Wohnungseinrichtung.`,
    );
  }

  const hatAnspruch = !vermoegenUeberFreibetrag && auszahlbetrag > 0;

  return {
    gesamtbedarf,
    erwachsenenBedarf: round2(erwachsenenBedarf),
    kinderBedarf: round2(kinderBedarf),
    zuschlaege: round2(zuschlaege),
    deckelungAngewendet,
    einkommen: round2(anrechenbar),
    auszahlbetrag,
    vermoegenUeberFreibetrag,
    vermoegensfreibetragGesamt,
    hatAnspruch,
    hinweise,
  };
}

/**
 * Öffentliche Hauptfunktion: wählt den Regelsatz für das Bundesland und rechnet.
 * Achtung: alle Beträge in Euro/Monat.
 */
export function berechne(input: HaushaltInput): Ergebnis {
  const land = BUNDESLAENDER[input.bundesland];
  const regeln = regelsatzFuer(land);
  const ergebnis = berechneMitRegeln(input, regeln);

  // Bundesland-spezifischer Hinweis: Draft-Länder ohne geprüfte Kindersätze.
  if (land.status === 'draft' && input.kinder > 0 && land.saetze.kindFlach === 0) {
    ergebnis.hinweise.push(
      'Kindersätze für dieses Bundesland werden derzeit geprüft und sind im Rechner noch nicht enthalten.',
    );
  }

  return ergebnis;
}

/**
 * Liefert den Regelsatz für ein Bundesland.
 *  - Wien: geprüfte Regel-Datei (Quelle der Wahrheit).
 *  - Übrige Länder: vorläufig aus saetze-2026.ts abgeleitet, bis je Land eine
 *    eigene geprüfte Regel-Datei existiert. Keine erfundenen Zusatzwerte:
 *    offene Felder bleiben null, subsidiär-Ausschluss nur dort, wo bestätigt.
 */
function regelsatzFuer(land: Bundesland): Regelsatz {
  if (land.slug === 'wien') return WIEN_2026;

  return {
    bundesland: land.slug,
    jahr: 2026,
    stand: '',
    alleinstehend: land.saetze.alleinstehend,
    paar: round2(land.saetze.gemeinschaft * 2),
    gemeinschaft70: land.saetze.gemeinschaft,
    // 45 %-Satz im aktuellen Modell nicht aktiv (siehe Abweichung E); nie gelesen.
    gemeinschaft45: land.saetze.gemeinschaft,
    kindFlach: land.saetze.kindFlach,
    behindertenzuschlag: land.saetze.behindertenzuschlag,
    vermoegensfreibetragProPerson: land.saetze.vermoegensfreibetrag,
    deckel175: BUNDESWEIT_2026.deckel_erwachsene_175,
    // Für die übrigen Länder noch nicht modelliert — bewusst offen, nicht geraten.
    erwerbstaetigenfreibetrag: null,
    unter25ReduzierterSatz: null,
    // Subsidiär-Ausschluss nur dort erzwingen, wo offiziell bestätigt (Wien 2026).
    subsidiaerHatAnspruch: true,
  };
}

// ---------------------------------------------------------------------------
//  Hilfsfunktionen
// ---------------------------------------------------------------------------

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const EURO_FORMAT = new Intl.NumberFormat('de-AT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function euro(value: number): string {
  return EURO_FORMAT.format(value);
}
