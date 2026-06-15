/**
 * ============================================================================
 *  MINDESTSICHERUNG / SOZIALHILFE — SÄTZE & REGELN 2026
 * ============================================================================
 *
 *  Das ist die EINZIGE Datei, die du jährlich anfassen musst, wenn neue Sätze
 *  veröffentlicht werden. Alles andere im Code bleibt gleich.
 *
 *  Vorgehen für das jährliche Update (z.B. Anfang Jänner):
 *    1. Neue Werte vom Sozialministerium bzw. der jeweiligen Landesregierung
 *       holen (Quellen siehe unten).
 *    2. Werte unten ersetzen. Quellen-Kommentar mit Datum aktualisieren.
 *    3. STAND.datum oben anpassen.
 *    4. `npm run build` lokal laufen lassen, dann committen + pushen.
 *
 *  WICHTIG für die Glaubwürdigkeit der Seite:
 *  - Niemals raten. Lieber den Bundesland-Status auf "in Prüfung" lassen
 *    als falsche Werte zeigen.
 *  - TODO-VERIFY-Markierungen sind Pflicht für nicht offiziell bestätigte Daten.
 *
 *  Offizielle Quellen:
 *    - Sozialministerium: https://www.sozialministerium.gv.at/Themen/Soziales/Sozialhilfe-und-Mindestsicherung.html
 *    - oesterreich.gv.at: https://www.oesterreich.gv.at
 *    - Stadt Wien:       https://www.wien.gv.at
 *    - RIS (Gesetze):    https://www.ris.bka.gv.at
 * ============================================================================
 */

export const STAND = {
  jahr: 2026,
  datum: '2026-01-01', // letzter Datenstand
};

// ---------------------------------------------------------------------------
//  BUNDESWEITE OBERGRENZEN (SH-GG)
// ---------------------------------------------------------------------------
//  Das Sozialhilfe-Grundsatzgesetz (SH-GG) gibt NUR Höchstsätze vor.
//  Die Länder dürfen darunter bleiben. Kinderbeträge sind seit VfGH 2019
//  reine Ländersache.
//
//  Quelle: Sozialministerium, Stand 2026.
// ---------------------------------------------------------------------------

export const BUNDESWEIT_2026 = {
  // Volle Geldleistung (100% Richtsatz)
  alleinstehend_100: 1229.89,

  // Erwachsener in Gemeinschaft/Partnerschaft (70%)
  gemeinschaft_70: 860.92,

  // Paar zusammen (140%) — nicht aktiv genutzt, nur zur Info
  paar_140: 1721.85,

  // Deckelung: Summe Geldleistungen Erwachsene pro Haushalt (175%)
  deckel_erwachsene_175: 2152.31,

  // Vermögensfreibetrag pro volljähriger Person
  vermoegensfreibetrag_pro_erwachsener: 7379.34,

  // Geringfügigkeitsgrenze 2026 (relevant für Einkommens-Anrechnung)
  geringfuegigkeitsgrenze_monat: 551.10,
} as const;

// ---------------------------------------------------------------------------
//  BUNDESLÄNDER — STATUS & WERTE
// ---------------------------------------------------------------------------
//  status:
//    - "verified": alle Werte offiziell geprüft → Rechner voll nutzbar
//    - "draft":    Werte vorläufig → UI zeigt Hinweis "wird derzeit geprüft"
// ---------------------------------------------------------------------------

export type BundeslandSlug =
  | 'wien'
  | 'niederoesterreich'
  | 'oberoesterreich'
  | 'steiermark'
  | 'kaernten'
  | 'salzburg'
  | 'tirol'
  | 'vorarlberg'
  | 'burgenland';

export type Bundesland = {
  slug: BundeslandSlug;
  name: string;
  /** Wie das System im jeweiligen Bundesland heißt. */
  systemName: 'Mindestsicherung' | 'Sozialhilfe';
  status: 'verified' | 'draft';
  /** Mindeststandards in Euro pro Monat */
  saetze: {
    alleinstehend: number;
    /** Pro erwachsene Person in Ehe/Partnerschaft/Lebensgemeinschaft/WG */
    gemeinschaft: number;
    /** Pro minderjährigem Kind (Wien: flach, andere Länder oft gestaffelt — hier TODO-VERIFY) */
    kindFlach: number;
    /** Behindertenzuschlag pro qualifizierter Person */
    behindertenzuschlag: number;
    /** Vermögensfreibetrag pro volljähriger Person */
    vermoegensfreibetrag: number;
  };
  /** Spezielle Hinweise, die im UI als Warnung gezeigt werden. */
  hinweise: string[];
  /** Offizielle Quelle für genauere Infos. */
  quelle: { label: string; url: string };
};

// ---------------------------------------------------------------------------
//  WIEN — vollständig geprüft, Basis für MVP
// ---------------------------------------------------------------------------
//  Geprüft anhand BRIEF.md Abschnitt 5 (Stand 2026-01-01).
//  Wichtige Änderungen ab 1.1.2026 (im UI als Hinweis sichtbar):
//    - Subsidiär Schutzberechtigte: kein Anspruch mehr (→ Grundversorgung).
//    - Elternzuschlag (~54,41 €) per 31.12.2025 ersatzlos gestrichen.
//    - Aufteilung 75% Lebensunterhalt / 25% Wohnbedarf.
//    - WGs werden wie Bedarfsgemeinschaften behandelt (70%-Satz).
//    - Junge Erwachsene 18–25 nur bei Ausbildung/Erwerb erhöht.
//
//  Rechenbeispiel (Probe): Paar 25+ mit 2 Kindern:
//    860,92 + 860,92 + 332,07 + 332,07 = 2.385,98 €
// ---------------------------------------------------------------------------

const WIEN: Bundesland = {
  slug: 'wien',
  name: 'Wien',
  systemName: 'Mindestsicherung',
  status: 'verified',
  saetze: {
    // Rundungsregel: Wien-Komponentensumme 922,41 + 307,47 = 1229,88 ist für den
    // Wien-Rechner verbindlich, NICHT der gerundete Bundes-Höchstsatz 1229,89.
    // Quelle der Wahrheit für die Wien-Berechnung ist src/lib/rules/wien-2026.json.
    alleinstehend: 1229.88,
    gemeinschaft: 860.92,
    kindFlach: 332.07,
    behindertenzuschlag: 221.38,
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [
    'Mietbeihilfe ist nicht im Rechner enthalten — sie wird in Wien separat berechnet.',
    'Subsidiär Schutzberechtigte erhalten seit 1.1.2026 keine Mindestsicherung mehr, sondern Grundversorgung.',
    'Der „Elternzuschlag" wurde per 31.12.2025 ersatzlos gestrichen.',
  ],
  quelle: {
    label: 'Stadt Wien — Mindestsicherung',
    url: 'https://www.wien.gv.at/menschen/armut/mindestsicherung/',
  },
};

// ---------------------------------------------------------------------------
//  ANDERE BUNDESLÄNDER — Vorlagen, alle als DRAFT markiert
// ---------------------------------------------------------------------------
//  Diese Werte sind aus den bundesweiten Höchstsätzen geschätzt und müssen
//  vor dem Live-Schalten der jeweiligen Bundesland-Seite einzeln verifiziert
//  werden. Status bleibt "draft" → UI zeigt einen klaren Hinweis.
//
//  Beim Verifizieren das Schema "Wien" als Vorbild nehmen.
// ---------------------------------------------------------------------------

const NIEDEROESTERREICH: Bundesland = {
  slug: 'niederoesterreich',
  name: 'Niederösterreich',
  systemName: 'Sozialhilfe',
  status: 'draft',
  saetze: {
    alleinstehend: 1229.89, // TODO-VERIFY Quelle: NÖ-SAG
    gemeinschaft: 860.92, // TODO-VERIFY
    kindFlach: 0, // TODO-VERIFY — NÖ staffelt evtl. nach Kinderzahl
    behindertenzuschlag: 221, // TODO-VERIFY
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [],
  quelle: {
    label: 'Land Niederösterreich — Sozialhilfe',
    url: 'https://www.noe.gv.at/noe/Soziales/Sozialhilfe.html',
  },
};

const OBEROESTERREICH: Bundesland = {
  slug: 'oberoesterreich',
  name: 'Oberösterreich',
  systemName: 'Sozialhilfe',
  status: 'draft',
  saetze: {
    alleinstehend: 1229.89, // TODO-VERIFY
    gemeinschaft: 860.92, // TODO-VERIFY
    kindFlach: 0, // TODO-VERIFY — OÖ staffelt nach Kinderzahl
    behindertenzuschlag: 221, // TODO-VERIFY
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [],
  quelle: {
    label: 'Land Oberösterreich — Sozialhilfe',
    url: 'https://www.land-oberoesterreich.gv.at/sozialhilfe.htm',
  },
};

const STEIERMARK: Bundesland = {
  slug: 'steiermark',
  name: 'Steiermark',
  systemName: 'Sozialhilfe',
  status: 'draft',
  saetze: {
    alleinstehend: 1229.89, // TODO-VERIFY
    gemeinschaft: 860.92, // TODO-VERIFY
    kindFlach: 0, // TODO-VERIFY
    behindertenzuschlag: 221, // TODO-VERIFY
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [],
  quelle: {
    label: 'Land Steiermark — Sozialhilfe',
    url: 'https://www.soziales.steiermark.at/',
  },
};

const KAERNTEN: Bundesland = {
  slug: 'kaernten',
  name: 'Kärnten',
  systemName: 'Sozialhilfe',
  status: 'draft',
  saetze: {
    alleinstehend: 1229.89, // TODO-VERIFY
    gemeinschaft: 860.92, // TODO-VERIFY
    kindFlach: 0, // TODO-VERIFY — Kärnten zahlt flach pro Kind
    behindertenzuschlag: 221, // TODO-VERIFY
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [],
  quelle: {
    label: 'Land Kärnten — Sozialhilfe',
    url: 'https://www.ktn.gv.at/Service/Sozialhilfe',
  },
};

const SALZBURG: Bundesland = {
  slug: 'salzburg',
  name: 'Salzburg',
  systemName: 'Sozialhilfe',
  status: 'draft',
  saetze: {
    alleinstehend: 1229.89, // TODO-VERIFY
    gemeinschaft: 860.92, // TODO-VERIFY
    kindFlach: 0, // TODO-VERIFY — Salzburg zahlt flach pro Kind
    behindertenzuschlag: 221, // TODO-VERIFY
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [],
  quelle: {
    label: 'Land Salzburg — Sozialhilfe',
    url: 'https://www.salzburg.gv.at/themen/soziales/sozialhilfe',
  },
};

const TIROL: Bundesland = {
  slug: 'tirol',
  name: 'Tirol',
  systemName: 'Sozialhilfe',
  status: 'draft',
  saetze: {
    alleinstehend: 1229.89, // TODO-VERIFY
    gemeinschaft: 922.5, // TODO-VERIFY — Tirol-Paare liegen höher (~1.845 € statt 1.721,85 €)
    kindFlach: 0, // TODO-VERIFY
    behindertenzuschlag: 221, // TODO-VERIFY
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [
    'Tirol hatte zum Jahreswechsel 2026 noch kein Ausführungsgesetz. Werte vorläufig.',
  ],
  quelle: {
    label: 'Land Tirol — Sozialhilfe',
    url: 'https://www.tirol.gv.at/gesellschaft-soziales/soziales/sozialhilfe/',
  },
};

const VORARLBERG: Bundesland = {
  slug: 'vorarlberg',
  name: 'Vorarlberg',
  systemName: 'Sozialhilfe',
  status: 'draft',
  saetze: {
    alleinstehend: 1229.89, // TODO-VERIFY
    gemeinschaft: 860.92, // TODO-VERIFY
    kindFlach: 0, // TODO-VERIFY
    behindertenzuschlag: 221, // TODO-VERIFY
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [],
  quelle: {
    label: 'Land Vorarlberg — Sozialhilfe',
    url: 'https://vorarlberg.at/-/sozialhilfe',
  },
};

const BURGENLAND: Bundesland = {
  slug: 'burgenland',
  name: 'Burgenland',
  systemName: 'Sozialhilfe',
  status: 'draft',
  saetze: {
    alleinstehend: 1229.89, // TODO-VERIFY
    gemeinschaft: 860.92, // TODO-VERIFY
    kindFlach: 0, // TODO-VERIFY — Burgenland zahlt flach pro Kind
    behindertenzuschlag: 221, // TODO-VERIFY
    vermoegensfreibetrag: 7379.34,
  },
  hinweise: [],
  quelle: {
    label: 'Land Burgenland — Sozialhilfe',
    url: 'https://www.burgenland.at/themen/gesellschaft/soziales/sozialhilfe/',
  },
};

export const BUNDESLAENDER: Record<BundeslandSlug, Bundesland> = {
  wien: WIEN,
  niederoesterreich: NIEDEROESTERREICH,
  oberoesterreich: OBEROESTERREICH,
  steiermark: STEIERMARK,
  kaernten: KAERNTEN,
  salzburg: SALZBURG,
  tirol: TIROL,
  vorarlberg: VORARLBERG,
  burgenland: BURGENLAND,
};

/** Reihenfolge für Dropdown — alphabetisch, Wien zuerst (größter Traffic). */
export const BUNDESLAND_REIHENFOLGE: BundeslandSlug[] = [
  'wien',
  'burgenland',
  'kaernten',
  'niederoesterreich',
  'oberoesterreich',
  'salzburg',
  'steiermark',
  'tirol',
  'vorarlberg',
];

export const DISCLAIMER =
  'Unverbindliche Orientierung, keine Rechts- oder Sozialberatung. Maßgeblich sind die zuständigen Stellen des jeweiligen Bundeslandes.';
