/**
 * Typisierte Testdaten-Fabriken (docs/testing.md): nur Abweichendes angeben,
 * Rest sinnvoll vorbelegt. Ändert sich das Datenmodell, brechen diese
 * Funktionen beim Kompilieren — unser Drift-Signal.
 */
let seq = 0;
const nextId = (prefix) => `${prefix}-${++seq}`;
export function makeEvent(overrides = {}) {
    const id = overrides.id ?? nextId('ev-test');
    return {
        id,
        title: `Testereignis ${id}`,
        start: { year: 1500 },
        precision: 'year',
        type: 'typ-ereignis',
        categories: ['cat-politik'],
        placeIds: [],
        description: '',
        ...overrides,
    };
}
export function makePlace(overrides = {}) {
    const id = overrides.id ?? nextId('pl-test');
    return { id, name: `Testort ${id}`, ...overrides };
}
export function makeTaxonomy(overrides = {}) {
    return {
        categories: [
            { id: 'cat-politik', name: 'Politik', children: [] },
            { id: 'cat-militaer', name: 'Militär', children: [] },
        ],
        types: [
            { id: 'typ-ereignis', name: 'Ereignis' },
            { id: 'typ-schlacht', name: 'Schlacht' },
        ],
        ...overrides,
    };
}
