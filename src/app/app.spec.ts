import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { expectNoAxeViolations } from './testing/axe.testing';

// L2-Beispieltest (docs/testing.md): Komponente rendern, DOM prüfen, AXE.
describe('App', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('rendert den Titel', async () => {
    const { host } = await setup();
    expect(host.querySelector('h1')?.textContent).toContain('history-timeline');
  });

  it('besteht die AXE-Prüfung', async () => {
    const { host } = await setup();
    await expectNoAxeViolations(host);
  });
});
