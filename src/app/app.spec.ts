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

  it('zeigt die geladenen Ereignisse auf der Timeline (im 1400–1700-Ausschnitt)', async () => {
    const { host } = await setup();
    // Lepanto (1571) liegt im Ausschnitt, das Römische Kaiserreich (-27–476) nicht:
    expect(host.querySelector('.count')?.textContent).toContain('1 von 2 Ereignissen');
    expect(host.querySelectorAll('.point circle')).toHaveLength(1);
    expect(host.querySelector('svg')).not.toBeNull();
  });

  it('zeigt den Fehlerzustand als role=alert', async () => {
    const { host } = await setup(new FakeEventRepository({ failOnLoad: true }));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Daten konnten nicht geladen werden');
    expect(host.querySelector('svg')).toBeNull();
  });

  it('besteht die AXE-Prüfung (geladener Zustand)', async () => {
    const { host } = await setup();
    await expectNoAxeViolations(host);
  });
});
