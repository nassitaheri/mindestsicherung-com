/**
 * ============================================================================
 *  SEED-ADAPTER
 * ============================================================================
 *
 *  Die Feldnamen in docs/seed/wien-2026-seed.json sind laut Seed "illustrativ".
 *  Dieser Adapter mappt sie auf die echte Rechner-Schnittstelle `HaushaltInput`,
 *  damit die offiziellen Berechnungsbeispiele 1:1 als Golden-Tests laufen.
 *
 *  Bewusst klein gehalten: nur das, was die golden_cases tatsächlich liefern.
 * ============================================================================
 */

import type { HaushaltInput } from '../calc';
import type { BundeslandSlug } from '../../data/saetze-2026';

/** Input-Form, wie sie in den golden_cases der Seed steht (illustrativ). */
export type SeedInput = {
  haushalt: 'alleinstehend' | 'paar';
  alter?: number;
  partner_alter?: number;
  kinder?: number;
  erwerbseinkommen?: number;
  behinderung?: boolean;
  subsidiaer?: boolean;
  in_ausbildung?: boolean;
  erwerbstaetig?: boolean;
};

/**
 * Mappt einen Seed-Golden-Case-Input auf den echten `HaushaltInput`.
 * Die Seed beschreibt ausschließlich Wien, daher ist 'wien' der Default.
 */
export function seedInputToHaushaltInput(
  seed: SeedInput,
  bundesland: BundeslandSlug = 'wien',
): HaushaltInput {
  const erwerbseinkommen = seed.erwerbseinkommen ?? 0;

  // Abweichung C: 18–25 ohne Ausbildung UND ohne Erwerbstätigkeit.
  // Nur ableiten, wenn die Seed beide Status explizit angibt.
  const jung = typeof seed.alter === 'number' && seed.alter >= 18 && seed.alter < 25;
  const ohneAusbildungUndErwerb = seed.in_ausbildung === false && seed.erwerbstaetig === false;

  return {
    bundesland,
    konstellation: seed.haushalt === 'paar' ? 'paar' : 'alleinstehend',
    erwachsene: seed.haushalt === 'paar' ? 2 : 1,
    kinder: seed.kinder ?? 0,
    mitBehinderung: seed.behinderung ? 1 : 0,
    einkommenMonat: erwerbseinkommen,
    vermoegen: 0,

    // Geprüfte Sonderregeln A/B/C:
    subsidiaerSchutzberechtigt: seed.subsidiaer ?? false,
    // Die Seed nennt das Feld "erwerbseinkommen" → es IST Erwerbseinkommen.
    einkommenIstErwerbstaetig: erwerbseinkommen > 0,
    unter25OhneAusbildung: jung && ohneAusbildungUndErwerb,
  };
}
