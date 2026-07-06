/** Deutsche Monatsnamen als Konstante — kein Intl-/Locale-Risiko in Tests. */
const MONTHS = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
];
/**
 * Jahresanzeige für beliebige Größenordnungen (löst Q7).
 * Exakte Werte: normale Jahre; kompakt: „4,6 Mrd. v. Chr.", „66 Mio. v. Chr.".
 */
export function formatAxisYear(year) {
    const abs = Math.abs(year);
    const suffix = year < 0 ? ' v. Chr.' : '';
    if (abs >= 1_000_000_000)
        return `${trimDecimal(abs / 1_000_000_000)} Mrd.${suffix}`;
    if (abs >= 1_000_000)
        return `${trimDecimal(abs / 1_000_000)} Mio.${suffix}`;
    if (abs >= 10_000)
        return `${groupThousands(Math.round(abs))}${suffix}`;
    return year < 0 ? `${abs} v. Chr.` : String(year);
}
/**
 * Präzisionsgerechte Datumsanzeige (Spec 1f): erst hier wird das
 * `precision`-Feld des Modells sichtbar.
 * - day   → „7. Oktober 1571"
 * - month → „September 1529"
 * - year  → „1571"
 * - circa → „um 1450" / „um 4,6 Mrd. v. Chr."
 * Fehlen Monat/Tag trotz feiner Präzision, degradiert die Anzeige aufs Jahr.
 */
export function formatHistoricalDate(date, precision) {
    const year = formatAxisYear(date.year);
    switch (precision) {
        case 'day':
            return date.month !== undefined && date.day !== undefined
                ? `${date.day}. ${MONTHS[date.month - 1]} ${year}`
                : year;
        case 'month':
            return date.month !== undefined ? `${MONTHS[date.month - 1]} ${year}` : year;
        case 'year':
            return year;
        case 'circa':
            return `um ${year}`;
    }
}
/** Datum(e) eines Events: Zeitpunkt oder „von – bis". */
export function formatEventDate(event) {
    const start = formatHistoricalDate(event.start, event.precision);
    return event.end ? `${start} – ${formatHistoricalDate(event.end, event.precision)}` : start;
}
/** 4.6 → „4,6", 4.0 → „4" */
function trimDecimal(value) {
    const rounded = Math.round(value * 10) / 10;
    return String(rounded).replace('.', ',');
}
/** 300000 → „300.000" */
function groupThousands(value) {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
