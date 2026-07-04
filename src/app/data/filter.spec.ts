import { expandCategorySelection, filterEvents } from './filter';
import { CategoryNode } from './model';
import { makeEvent } from '../testing/fixtures';

const lepanto = makeEvent({ id: 'lepanto', type: 'typ-schlacht', categories: ['cat-militaer', 'cat-religion'] });
const thesen = makeEvent({ id: 'thesen', type: 'typ-ereignis', categories: ['cat-religion'] });
const geburt = makeEvent({ id: 'geburt', type: 'typ-geburt', categories: ['cat-religion'] });

describe('expandCategorySelection', () => {
  const tree: CategoryNode[] = [
    {
      id: 'cat-militaer',
      name: 'Militär',
      children: [{ id: 'cat-seekrieg', name: 'Seekrieg', children: [] }],
    },
    { id: 'cat-religion', name: 'Religion', children: [] },
  ];

  it('schließt Nachfahren gewählter Knoten ein (Baum-Semantik)', () => {
    const expanded = expandCategorySelection(tree, ['cat-militaer']);
    expect(expanded.has('cat-militaer')).toBe(true);
    expect(expanded.has('cat-seekrieg')).toBe(true);
    expect(expanded.has('cat-religion')).toBe(false);
  });

  it('ein gewähltes Kind zieht nicht den Elternknoten mit', () => {
    const expanded = expandCategorySelection(tree, ['cat-seekrieg']);
    expect(expanded.has('cat-seekrieg')).toBe(true);
    expect(expanded.has('cat-militaer')).toBe(false);
  });

  it('leere Auswahl bleibt leer', () => {
    expect(expandCategorySelection(tree, []).size).toBe(0);
  });
});

describe('filterEvents', () => {
  const allTypes = new Set(['typ-schlacht', 'typ-ereignis', 'typ-geburt']);
  const events = [lepanto, thesen, geburt];

  it('ODER-Semantik: Lepanto bleibt, solange EINE seiner Kategorien gewählt ist', () => {
    const nurReligion = filterEvents(events, new Set(['cat-religion']), allTypes);
    expect(nurReligion.map((e) => e.id)).toEqual(['lepanto', 'thesen', 'geburt']);
  });

  it('Lepanto verschwindet erst, wenn beide Kategorien abgewählt sind', () => {
    const keineVonBeiden = filterEvents(events, new Set<string>(), allTypes);
    expect(keineVonBeiden).toEqual([]);
  });

  it('Typ-Filter wirkt unabhängig von den Kategorien (UND)', () => {
    const ohneGeburten = filterEvents(events, new Set(['cat-religion', 'cat-militaer']), new Set(['typ-schlacht', 'typ-ereignis']));
    expect(ohneGeburten.map((e) => e.id)).toEqual(['lepanto', 'thesen']);
  });

  it('leere Typ-Auswahl blendet alles aus', () => {
    expect(filterEvents(events, new Set(['cat-religion']), new Set<string>())).toEqual([]);
  });
});
