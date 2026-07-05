import { formatEventDate, formatHistoricalDate } from './format';
import { makeEvent } from '../testing/fixtures';

describe('formatHistoricalDate', () => {
  it('day: „7. Oktober 1571"', () => {
    expect(formatHistoricalDate({ year: 1571, month: 10, day: 7 }, 'day')).toBe('7. Oktober 1571');
  });

  it('month: „September 1529"', () => {
    expect(formatHistoricalDate({ year: 1529, month: 9 }, 'month')).toBe('September 1529');
  });

  it('year: „1571"', () => {
    expect(formatHistoricalDate({ year: 1571 }, 'year')).toBe('1571');
  });

  it('circa: „um 1450" und „um 4,6 Mrd. v. Chr."', () => {
    expect(formatHistoricalDate({ year: 1450 }, 'circa')).toBe('um 1450');
    expect(formatHistoricalDate({ year: -4_600_000_000 }, 'circa')).toBe('um 4,6 Mrd. v. Chr.');
  });

  it('v. Chr. bei Tagespräzision', () => {
    expect(formatHistoricalDate({ year: -480, month: 8, day: 11 }, 'day')).toBe('11. August 480 v. Chr.');
  });

  it('degradiert aufs Jahr, wenn Monat/Tag fehlen', () => {
    expect(formatHistoricalDate({ year: 1571 }, 'day')).toBe('1571');
    expect(formatHistoricalDate({ year: 1529 }, 'month')).toBe('1529');
  });
});

describe('formatEventDate', () => {
  it('Zeitpunkt: nur ein Datum', () => {
    const e = makeEvent({ start: { year: 1571, month: 10, day: 7 }, precision: 'day' });
    expect(formatEventDate(e)).toBe('7. Oktober 1571');
  });

  it('Zeitspanne: „von – bis"', () => {
    const e = makeEvent({
      start: { year: 1618, month: 5, day: 23 },
      end: { year: 1648, month: 10, day: 24 },
      precision: 'day',
    });
    expect(formatEventDate(e)).toBe('23. Mai 1618 – 24. Oktober 1648');
  });
});
