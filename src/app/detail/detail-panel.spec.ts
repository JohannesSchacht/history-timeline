import { TestBed } from '@angular/core/testing';
import { EventRepository } from '../data/event-repository';
import { TimelineStore } from '../state/timeline.store';
import { expectNoAxeViolations } from '../testing/axe.testing';
import { FakeEventRepository } from '../testing/fake-event-repository';
import { makeEvent, makePlace, makeTaxonomy } from '../testing/fixtures';
import { DetailPanel } from './detail-panel';

// L2 (Kategorie C): Panel + Store + Fake-Repository.
describe('DetailPanel', () => {
  const lepanto = makeEvent({
    id: 'lepanto',
    title: 'Seeschlacht von Lepanto',
    start: { year: 1571, month: 10, day: 7 },
    precision: 'day',
    type: 'typ-schlacht',
    categories: ['cat-militaer', 'cat-religion'],
    placeIds: ['pl-lepanto'],
    description: 'Die Heilige Liga besiegt die osmanische Flotte.',
  });
  const buchdruck = makeEvent({
    id: 'buchdruck',
    title: 'Buchdruck',
    start: { year: 1450 },
    precision: 'circa',
    type: 'typ-ereignis',
    categories: ['cat-militaer'],
    placeIds: [],
  });

  async function setup(selectId: string | null) {
    const fake = new FakeEventRepository({
      events: [lepanto, buchdruck],
      places: [makePlace({ id: 'pl-lepanto', name: 'Lepanto (Naupaktos)' })],
      taxonomy: makeTaxonomy({
        categories: [
          { id: 'cat-militaer', name: 'Militär', children: [] },
          { id: 'cat-religion', name: 'Religion', children: [] },
        ],
        types: [
          { id: 'typ-schlacht', name: 'Schlacht' },
          { id: 'typ-ereignis', name: 'Ereignis' },
        ],
      }),
    });
    TestBed.configureTestingModule({
      imports: [DetailPanel],
      providers: [{ provide: EventRepository, useValue: fake }],
    });
    const store = TestBed.inject(TimelineStore);
    await store.load();
    store.toggleEvent(selectId);
    const fixture = TestBed.createComponent(DetailPanel);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, store, host: fixture.nativeElement as HTMLElement };
  }

  it('zeigt alle Felder des gewählten Events mit aufgelösten Namen', async () => {
    const { host } = await setup('lepanto');
    expect(host.querySelector('h2')?.textContent).toBe('Seeschlacht von Lepanto');
    const text = host.textContent ?? '';
    expect(text).toContain('7. Oktober 1571');
    expect(text).toContain('Schlacht');
    expect(text).toContain('Militär, Religion');
    expect(text).toContain('Lepanto (Naupaktos)');
    expect(text).toContain('Heilige Liga');
  });

  it('circa-Datierung wird als „um …" angezeigt; Ort-Zeile entfällt ohne Orte', async () => {
    const { host } = await setup('buchdruck');
    expect(host.textContent).toContain('um 1450');
    expect(host.textContent).not.toContain('Orte');
  });

  it('rendert nichts ohne Auswahl', async () => {
    const { host } = await setup(null);
    expect(host.querySelector('.detail')).toBeNull();
  });

  it('besteht die AXE-Prüfung', async () => {
    const { host } = await setup('lepanto');
    await expectNoAxeViolations(host);
  });
});
