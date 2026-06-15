/**
 * ============================================================================
 *  REGELSATZ — typisierte Brücke zwischen Regel-Datei (JSON) und Rechenlogik
 * ============================================================================
 *
 *  Die Rechenlogik (calc.ts) liest AUSSCHLIESSLICH aus einem `Regelsatz`.
 *  Es gibt keine hartcodierten Beträge in der Logik — jeder Betrag stammt
 *  aus einer Regel-Datei (z.B. src/lib/rules/wien-2026.json).
 *
 *  Oberstes Prinzip: KEINE Beträge erfinden. Werte mit status
 *  NEEDS_OFFICIAL_VALUE bleiben in der Regel-Datei `null` und kommen hier als
 *  `null` an. Die Logik MUSS den null-Fall ehrlich behandeln (TODO-Hinweis),
 *  nicht raten.
 * ============================================================================
 */

import wien2026Raw from './wien-2026.json';

/** Ein vollständig aufgelöster Regelsatz, wie ihn calc.ts konsumiert. */
export type Regelsatz = {
  /** Herkunft — für Transparenz, Tests und Anzeige. */
  bundesland: string;
  jahr: number;
  stand: string;

  // ---- Mindeststandards (absolute EUR-Beträge, KEINE Prozent-Literale) ----
  /** Voller Mindeststandard einer alleinstehenden Person. */
  alleinstehend: number;
  /** Paar gesamt (2 volljährige Personen in Bedarfsgemeinschaft). */
  paar: number;
  /** Pro volljähriger Person in Gemeinschaft (70 %). */
  gemeinschaft70: number;
  /** Ab der 3. volljährigen Person (45 %) — derzeit im Modell nicht aktiv. */
  gemeinschaft45: number;
  /** Pro minderjährigem Kind (Wien: flach). */
  kindFlach: number;
  /** Zuschlag pro Person mit Behindertenpass § 40 BBG. */
  behindertenzuschlag: number;
  /** Vermögensfreibetrag pro volljähriger Person. */
  vermoegensfreibetragProPerson: number;
  /** Deckel: Summe der Geldleistungen aller Volljährigen (175 %). */
  deckel175: number;

  // ---- Offene Werte (NEEDS_OFFICIAL_VALUE → null, NICHT raten) ----
  /**
   * Abweichung B: anrechnungsfreier ANTEIL des Erwerbseinkommens (Bruch 0..1).
   * null = noch nicht offiziell verifiziert → Logik rechnet konservativ 1:1.
   */
  erwerbstaetigenfreibetrag: number | null;
  /**
   * Abweichung C: reduzierter Mindeststandard (absoluter EUR-Betrag) für
   * 18–25 ohne Ausbildung/Erwerb. null = noch offen → Logik nutzt vollen Satz.
   */
  unter25ReduzierterSatz: number | null;

  // ---- Anspruchsregeln ----
  /** Abweichung A: false = subsidiär Schutzberechtigte ohne Anspruch (Wien 2026). */
  subsidiaerHatAnspruch: boolean;
};

// ---------------------------------------------------------------------------
//  Roh-JSON-Form (locker getypt — nur was wir tatsächlich lesen)
// ---------------------------------------------------------------------------

type RegelEintrag = {
  wert: number | boolean | null;
  status?: string;
  quelle?: string;
  hinweis?: string;
};

type RegelDatei = {
  meta?: { bundesland?: string; jahr?: number };
  stand?: string;
  rules: Record<string, RegelEintrag>;
};

/** Liest einen Pflicht-EUR-Wert. Wirft, wenn er fehlt oder null ist. */
function pflichtZahl(rules: Record<string, RegelEintrag>, key: string): number {
  const eintrag = rules[key];
  if (!eintrag || typeof eintrag.wert !== 'number') {
    throw new Error(
      `Regel-Datei kaputt: "${key}" fehlt oder ist kein Zahlenwert. ` +
        `Pflichtwerte dürfen nicht null sein — lieber den Rechner stoppen als falsch rechnen.`,
    );
  }
  return eintrag.wert;
}

/** Liest einen optionalen EUR-Wert. null (NEEDS_OFFICIAL_VALUE) ist erlaubt. */
function offeneZahl(rules: Record<string, RegelEintrag>, key: string): number | null {
  const eintrag = rules[key];
  if (!eintrag) {
    throw new Error(`Regel-Datei kaputt: "${key}" fehlt komplett.`);
  }
  return typeof eintrag.wert === 'number' ? eintrag.wert : null;
}

/** Liest einen Pflicht-Boolean. */
function pflichtBool(rules: Record<string, RegelEintrag>, key: string): boolean {
  const eintrag = rules[key];
  if (!eintrag || typeof eintrag.wert !== 'boolean') {
    throw new Error(`Regel-Datei kaputt: "${key}" fehlt oder ist kein Boolean.`);
  }
  return eintrag.wert;
}

/**
 * Wandelt eine eingelesene Regel-Datei in einen typisierten Regelsatz.
 * Pflichtwerte werden validiert; offene Werte (null) bleiben offen.
 */
export function ladeRegelsatz(datei: RegelDatei): Regelsatz {
  const { rules } = datei;
  return {
    bundesland: datei.meta?.bundesland ?? 'unbekannt',
    jahr: datei.meta?.jahr ?? 0,
    stand: datei.stand ?? '',

    alleinstehend: pflichtZahl(rules, 'mindeststandard_alleinstehend_gesamt'),
    paar: pflichtZahl(rules, 'mindeststandard_paar_gesamt'),
    gemeinschaft70: pflichtZahl(rules, 'mindeststandard_70prozent'),
    gemeinschaft45: pflichtZahl(rules, 'mindeststandard_45prozent'),
    kindFlach: pflichtZahl(rules, 'mindeststandard_kind'),
    behindertenzuschlag: pflichtZahl(rules, 'behindertenzuschlag'),
    vermoegensfreibetragProPerson: pflichtZahl(rules, 'vermoegensfreibetrag_pro_person'),
    deckel175: pflichtZahl(rules, 'deckel_175prozent_volljaehrige'),

    erwerbstaetigenfreibetrag: offeneZahl(rules, 'erwerbstaetigenfreibetrag'),
    unter25ReduzierterSatz: offeneZahl(rules, 'unter25_reduzierter_satz_ohne_ausbildung'),

    subsidiaerHatAnspruch: pflichtBool(rules, 'subsidiaer_schutzberechtigt_anspruch'),
  };
}

/** Der fertig aufgelöste Wien-2026-Regelsatz — Quelle der Wahrheit für den Rechner. */
export const WIEN_2026: Regelsatz = ladeRegelsatz(wien2026Raw as RegelDatei);
