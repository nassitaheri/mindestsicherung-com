/**
 * ============================================================================
 *  GOLDEN-MASTER-TESTS — Wien 2026
 * ============================================================================
 *
 *  Orakel ist die geprüfte Seed-Datei docs/seed/wien-2026-seed.json. Ihre
 *  golden_cases sind offizielle Berechnungsbeispiele und werden hier zu
 *  automatischen Tests, die jede Rechner-Änderung absichern (CI-Gate).
 *
 *  Oberstes Prinzip: KEINE Beträge erfinden.
 *    - status OK ................ aktiver Test, exakt auf den Cent.
 *    - expected_anspruch=false .. aktiver Test (Abweichung A, harter Ausschluss).
 *    - status NEEDS_OFFICIAL_VALUE  it.todo (exakter Wert offen) + aktive
 *                                   Mechanik-Assertion für die Richtung (B/C).
 *    - status NEEDS_VERIFY ....... it.skip mit Hinweis.
 *
 *  Die Mechanik-Assertions injizieren einen klar als hypothetisch markierten
 *  Testwert in den Regelsatz. Dieser Wert landet NIE in der ausgelieferten
 *  Regel-Datei (dort bleibt er null) — er beweist nur, dass der Hebel wirkt.
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import seed from '../../../docs/seed/wien-2026-seed.json';
import { berechne, berechneMitRegeln, type Regelsatz } from '../calc';
import { WIEN_2026 } from '../rules/regelsatz';
import { seedInputToHaushaltInput, type SeedInput } from '../rules/seed-adapter';

type GoldenCase = {
  id: string;
  input: SeedInput;
  expected_gesamt?: number | null;
  expected_anspruch?: boolean;
  status: 'OK' | 'NEEDS_VERIFY' | 'NEEDS_OFFICIAL_VALUE';
  berechnung?: string;
  hinweis?: string;
  quelle?: string;
};

const cases = seed.golden_cases as GoldenCase[];

function findCase(id: string): GoldenCase {
  const c = cases.find((x) => x.id === id);
  if (!c) throw new Error(`Golden Case "${id}" fehlt in der Seed-Datei.`);
  return c;
}

/** Voller öffentlicher Rechenweg (Wien → Regel-Datei). */
function rechneSeedFall(c: GoldenCase) {
  return berechne(seedInputToHaushaltInput(c.input));
}

// ---------------------------------------------------------------------------
//  OK — aktive Tests, exakt auf den Cent
// ---------------------------------------------------------------------------

describe('OK — exakter Gesamtbedarf (auf den Cent)', () => {
  const okFaelle = cases.filter(
    (c) => c.status === 'OK' && typeof c.expected_gesamt === 'number',
  );

  // Sicherheitsnetz: falls jemand die OK-Fälle aus der Seed entfernt.
  it('es gibt aktive OK-Fälle', () => {
    expect(okFaelle.length).toBeGreaterThanOrEqual(3);
  });

  for (const c of okFaelle) {
    it(`${c.id} → ${c.expected_gesamt} €`, () => {
      const erg = rechneSeedFall(c);
      expect(erg.gesamtbedarf).toBe(c.expected_gesamt);
      // Einkommen 0 in diesen Fällen → Auszahlbetrag = Gesamtbedarf.
      expect(erg.auszahlbetrag).toBe(c.expected_gesamt);
      expect(erg.hatAnspruch).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
//  Abweichung A — subsidiär Schutzberechtigte: harter Ausschluss
// ---------------------------------------------------------------------------

describe('A — subsidiär Schutzberechtigte ohne Anspruch', () => {
  const a = findCase('subsidiaer-schutzberechtigt');

  it(`${a.id} → hatAnspruch === false`, () => {
    const erg = rechneSeedFall(a);
    expect(erg.hatAnspruch).toBe(false);
    expect(erg.auszahlbetrag).toBe(0);
  });

  it('ohne Subsidiär-Status hätte derselbe Haushalt sehr wohl Anspruch (Gegenprobe)', () => {
    const ohne = berechne({
      ...seedInputToHaushaltInput(a.input),
      subsidiaerSchutzberechtigt: false,
    });
    expect(ohne.hatAnspruch).toBe(true);
  });
});

// ---------------------------------------------------------------------------
//  NEEDS_VERIFY — Behindertenzuschlag: bewusst übersprungen
// ---------------------------------------------------------------------------

describe('NEEDS_VERIFY — vor Aktivierung offiziell prüfen', () => {
  const beh = findCase('single-mit-behinderung-kein-einkommen');

  // Vor Aktivierung offiziell klären, ob der Behindertenzuschlag auf den vollen
  // Mindeststandard aufstockt (Vermutung lt. Seed: 1229.88 + 221.38 = 1451.26).
  it.skip(`${beh.id} — Behindertenzuschlag (Vermutung 1451.26 €, erst nach offizieller Bestätigung)`, () => {
    const erg = rechneSeedFall(beh);
    expect(erg.gesamtbedarf).toBe(1451.26);
  });
});

// ---------------------------------------------------------------------------
//  NEEDS_OFFICIAL_VALUE — exakter Wert offen (todo) + aktive Richtungs-Sicherung
// ---------------------------------------------------------------------------

describe('B — Erwerbstätigenfreibetrag (Wert offen)', () => {
  const b = findCase('single-mit-erwerbseinkommen-400');

  // Exakter Auszahlbetrag hängt am offiziellen Freibetrag → bleibt sichtbar offen.
  it.todo(
    `${b.id} — exakter Auszahlbetrag benötigt erwerbstaetigenfreibetrag (NEEDS_OFFICIAL_VALUE, Quelle: WMG/MA 40)`,
  );

  it(`${b.id} — Mechanik: ein gesetzter Freibetrag hebt das Ergebnis über den 1:1-Abzug`, () => {
    const input = seedInputToHaushaltInput(b.input);

    // Ausgeliefert (Freibetrag null) → konservativer 1:1-Abzug: 1229.88 − 400 = 829.88.
    const einsZuEins = berechneMitRegeln(input, WIEN_2026).auszahlbetrag;
    expect(einsZuEins).toBe(829.88);

    // Hypothetischer Freibetrag NUR im Test — niemals in der Regel-Datei.
    const hypothetisch: Regelsatz = { ...WIEN_2026, erwerbstaetigenfreibetrag: 0.2 };
    const mitFreibetrag = berechneMitRegeln(input, hypothetisch).auszahlbetrag;

    // Richtung lt. Seed-Hinweis: Ergebnis > Ergebnis bei 1:1-Abzug.
    expect(mitFreibetrag).toBeGreaterThan(einsZuEins);
  });
});

describe('C — reduzierter Satz für 18–25 ohne Ausbildung/Erwerb (Wert offen)', () => {
  const c = findCase('junger-erwachsener-20-ohne-ausbildung');

  it.todo(
    `${c.id} — exakter reduzierter Satz benötigt unter25_reduzierter_satz_ohne_ausbildung (NEEDS_OFFICIAL_VALUE, Quelle: WMG/MA 40)`,
  );

  it(`${c.id} — Mechanik: reduzierter Satz liegt unter dem vollen Satz`, () => {
    const input = seedInputToHaushaltInput(c.input);
    // Adapter muss die Konstellation überhaupt erkennen.
    expect(input.unter25OhneAusbildung).toBe(true);

    // Ausgeliefert (Wert null) → voller Satz 1229.88 (mit sichtbarem TODO-Hinweis).
    const vollerSatz = berechneMitRegeln(input, WIEN_2026).gesamtbedarf;
    expect(vollerSatz).toBe(1229.88);

    // Hypothetischer reduzierter Satz NUR im Test — niemals in der Regel-Datei.
    const hypothetisch: Regelsatz = { ...WIEN_2026, unter25ReduzierterSatz: 1000 };
    const reduziert = berechneMitRegeln(input, hypothetisch).gesamtbedarf;

    // Richtung lt. Seed-Hinweis: Ergebnis < voller Satz 1229.88.
    expect(reduziert).toBeLessThan(1229.88);
  });
});

// ---------------------------------------------------------------------------
//  Stolperdraht — offene Werte müssen offen bleiben, bis sie geprüft sind
// ---------------------------------------------------------------------------

describe('Stolperdraht: offene Werte bleiben null (sonst Golden-Test nachziehen)', () => {
  // Wird ROT, sobald ein offizieller Wert eingetragen wird. Das ist Absicht:
  // dann den zugehörigen it.todo oben durch einen echten Cent-genauen Test ersetzen.
  it('erwerbstaetigenfreibetrag ist noch nicht offiziell gesetzt', () => {
    expect(WIEN_2026.erwerbstaetigenfreibetrag).toBeNull();
  });

  it('unter25ReduzierterSatz ist noch nicht offiziell gesetzt', () => {
    expect(WIEN_2026.unter25ReduzierterSatz).toBeNull();
  });
});
