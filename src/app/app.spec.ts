import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { EventRepository } from './data/event-repository';
import { expectNoAxeViolations } from './testing/axe.testing';
import { FakeEventRepository } from './testing/fake-event-repository';
import { makeEvent } from './testing/fixtures';

// L2 (docs/testing.md): Komponente + Fake-Repository per DI; Zustände geladen/Fehler; AXE.
describe('App', () => {
  async function setup(fake: FakeEventRepository = defaultFake()) {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: EventRepository, useValue: fake }],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  function defaultFake(): FakeEventRepository {
    return new FakeEventRepository({
      events: [
        makeEvent({ id: 'ev-a', title: 'Seeschlacht von Lepanto', start: { year: 1571, month: 10, day: 7 } }),
        makeEvent({ id: 'ev-b', title: 'Römisches Kaiserreich', start: { year: -27 }, end: { year: 476 } }),
      ],
    });
  }

  it('rendert den Titel', async () => {
    const { host } = await setup();
    expect(host.querySelector('h1')?.textContent).toContain('history-timeline');
  });

  it('zeigt die geladenen Ereignisse als Liste', async () => {
    const { host } = await setup();
    expect(host.textContent).toContain('2 Ereignisse geladen');
    const items = [...host.querySelectorAll('.event-list li')].map((li) => li.textContent);
    expect(items[0]).toContain('Seeschlacht von Lepanto');
    expect(items[0]).toContain('1571');
    expect(items[1]).toContain('27 v. Chr.'); // formatYear + Spanne
    expect(items[1]).toContain('476');
  });

  it('zeigt den Fehlerzustand als role=alert', async () => {
    const { host } = await setup(new FakeEventRepository({ failOnLoad: true }));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Daten konnten nicht geladen werden');
    expect(host.querySelector('.event-list')).toBeNull();
  });

  it('besteht die AXE-Prüfung (geladener Zustand)', async () => {
    const { host } = await setup();
    await expectNoAxeViolations(host);
  });
});
