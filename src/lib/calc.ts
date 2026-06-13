/**
 * ============================================================================
 *  RECHENLOGIK — Mindestsicherung / Sozialhilfe
 * ============================================================================
 *
 *  Reine Funktion: bekommt einen Haushalts-Input und gibt ein Ergebnis zurück.
 *  Kein DOM, kein State, kein Framework. Einfach testbar.
 *
 *  Modell (siehe BRIEF.md Abschnitt 4):
 *    1. Gesamtbedarf = Summe Mindeststandards aller Haushaltsmitglieder
 *    2. Deckelung der Erwachsenen-Beträge auf 175% Richtsatz
 *    3. Minus anrechenbares Einkommen
 *    4. Vermögens-Check (Freibetrag pro volljähriger Person)
 *    5. Auszahlbetrag (ergänzende Mindestsicherung)
 * ============================================================================
 */

import { BUNDESLAENDER, BUNDESWEIT_2026, type BundeslandSlug } from '../data/saetze-2026';

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
  /** Anrechenbares Einkommen (1:1 abgezogen) */
  einkommen: number;
  /** Auszahlbetrag = max(0, Gesamtbedarf − Einkommen) */
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
 * Hauptfunktion: rechnet Input → Ergebnis.
 * Achtung: alle Beträge in Euro/Monat.
 */
export function berechne(input: HaushaltInput): Ergebnis {
  const land = BUNDESLAENDER[input.bundesland];
  const { saetze } = land;

  const hinweise: string[] = [];

  // ---- 1. Erwachsenen-Bedarf -------------------------------------------------
  let erwachsene = Math.max(1, Math.floor(input.erwachsene));
  if (input.konstellation === 'paar') erwachsene = 2;

  let erwachsenenBedarf = 0;
  if (input.konstellation === 'alleinstehend' || input.konstellation === 'alleinerziehend') {
    // Einzelne Person mit vollem Satz
    erwachsenenBedarf = saetze.alleinstehend;
  } else {
    // Paar oder WG: jeder Erwachsene erhält den Gemeinschafts-Satz (70%)
    erwachsenenBedarf = saetze.gemeinschaft * erwachsene;
  }

  // ---- 2. Deckelung Erwachsene (175%) ---------------------------------------
  const deckel = BUNDESWEIT_2026.deckel_erwachsene_175;
  let deckelungAngewendet = false;
  if (erwachsenenBedarf > deckel) {
    erwachsenenBedarf = deckel;
    deckelungAngewendet = true;
    hinweise.push(
      `Die Summe für die Erwachsenen wurde auf den Höchstbetrag von ${euro(deckel)} gedeckelt (175 % des Richtsatzes).`,
    );
  }

  // ---- 3. Kinder-Bedarf ------------------------------------------------------
  const kinder = Math.max(0, Math.floor(input.kinder));
  const kinderBedarf = kinder * saetze.kindFlach;

  if (land.status === 'draft' && kinder > 0 && saetze.kindFlach === 0) {
    hinweise.push(
      'Kindersätze für dieses Bundesland werden derzeit geprüft und sind im Rechner noch nicht enthalten.',
    );
  }

  // ---- 4. Zuschläge ---------------------------------------------------------
  const mitBehinderung = Math.max(0, Math.floor(input.mitBehinderung));
  const zuschlaege = mitBehinderung * saetze.behindertenzuschlag;

  // ---- 5. Gesamtbedarf ------------------------------------------------------
  const gesamtbedarf = round2(erwachsenenBedarf + kinderBedarf + zuschlaege);

  // ---- 6. Einkommen abziehen ------------------------------------------------
  const einkommen = Math.max(0, input.einkommenMonat);
  const nachEinkommen = gesamtbedarf - einkommen;
  const auszahlbetrag = round2(Math.max(0, nachEinkommen));

  if (einkommen >= gesamtbedarf) {
    hinweise.push(
      'Das anrechenbare Einkommen erreicht oder überschreitet den Gesamtbedarf — es besteht kein Anspruch auf ergänzende Mindestsicherung.',
    );
  }

  // ---- 7. Vermögens-Check ---------------------------------------------------
  const vermoegensfreibetragGesamt = round2(
    erwachsene * saetze.vermoegensfreibetrag,
  );
  const vermoegenUeberFreibetrag = input.vermoegen > vermoegensfreibetragGesamt;
  if (vermoegenUeberFreibetrag) {
    hinweise.push(
      `Das angegebene Vermögen liegt über dem Freibetrag von ${euro(vermoegensfreibetragGesamt)} (${euro(saetze.vermoegensfreibetrag)} pro volljähriger Person). Ersparnisse müssen grundsätzlich zuerst verbraucht werden. Ausnahmen: selbst bewohnte Eigentumswohnung, berufs- oder behinderungsbedingt notwendiges Auto, Wohnungseinrichtung.`,
    );
  }

  const hatAnspruch = !vermoegenUeberFreibetrag && auszahlbetrag > 0;

  return {
    gesamtbedarf,
    erwachsenenBedarf: round2(erwachsenenBedarf),
    kinderBedarf: round2(kinderBedarf),
    zuschlaege: round2(zuschlaege),
    deckelungAngewendet,
    einkommen: round2(einkommen),
    auszahlbetrag,
    vermoegenUeberFreibetrag,
    vermoegensfreibetragGesamt,
    hatAnspruch,
    hinweise,
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
