/**
 * Österreichische Datumsformatierung.
 * Wandelt ein ISO-Datum (YYYY-MM-DD) in das sichtbare Langformat um, z.B.
 * "2026-01-01" -> "1. Jänner 2026". Bewusst mit "Jänner" statt "Januar".
 *
 * ISO bleibt die Datenquelle (sortierbar, maschinenlesbar); formatiert wird
 * erst bei der Anzeige. Einzige Stelle für dieses Format im Projekt.
 */
const AT_MONATE = [
  'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function formatAT(iso: string): string {
  const [jahr, monat, tag] = iso.split('-').map(Number);
  return `${tag}. ${AT_MONATE[monat - 1]} ${jahr}`;
}
