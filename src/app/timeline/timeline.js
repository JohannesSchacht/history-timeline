var Timeline_1;
import { __decorate } from "tslib";
import { Component, DestroyRef, afterNextRender, computed, inject, input, output, signal, viewChild, } from '@angular/core';
import { formatYear } from '../data/model';
import { xToYear } from './layout/time-scale';
import { LAYOUT, layoutTimeline } from './layout/timeline-layout';
import { panViewport, wheelBoost, wheelZoomFactor, zoomViewport } from './layout/viewport-controls';
/**
 * Timeline-Komponente (testing.md Kategorie T): zeichnet das Ergebnis von
 * layoutTimeline stumpf ab — alle Geometrie kommt aus dem Layout-Modul.
 *
 * Interaktion (Spec 1d): Wheel = Zoom um den Cursor, Pointer-Drag = Pan.
 * Die Handler sind bewusst dünn — sie übersetzen nur Maus-Pixel in
 * viewBox-Einheiten und rufen die reinen viewport-controls-Funktionen.
 * Der Viewport-State selbst gehört dem Eltern-Element (Signal in App).
 */
let Timeline = class Timeline {
    static { Timeline_1 = this; }
    events = input.required();
    viewport = input.required();
    /** hervorzuhebendes Event (1f) */
    selectedId = input(null);
    viewportChange = output();
    /** Marker geklickt (Event-ID) bzw. Hintergrund geklickt (null) */
    eventSelected = output();
    svg = viewChild.required('svgRoot');
    dragging = signal(false);
    lastPointerX = null;
    /** trennt Klick von Pan-Drag (Spec 1f): Bewegung über der Schwelle → kein Klick */
    movedPx = 0;
    static CLICK_THRESHOLD_PX = 4;
    /** Wheel-Beschleunigung (1d-Nachtrag): Rasten in kurzer Folge zählen */
    wheelStreak = 0;
    lastWheelAt = 0;
    constructor() {
        // Viewport-Breite an die echte Pixelbreite koppeln (Erspiel-Feedback):
        // 1 viewBox-Einheit ≈ 1 px → breite Bildschirme zeigen MEHR, nicht GRÖSSER.
        const destroyRef = inject(DestroyRef);
        afterNextRender(() => {
            if (typeof ResizeObserver === 'undefined')
                return; // jsdom
            const el = this.svg().nativeElement;
            const observer = new ResizeObserver(() => {
                const width = Math.round(el.getBoundingClientRect().width);
                if (width > 0 && width !== this.viewport().widthPx) {
                    this.viewportChange.emit({ ...this.viewport(), widthPx: width });
                }
            });
            observer.observe(el);
            destroyRef.onDestroy(() => observer.disconnect());
        });
    }
    LAYOUT = LAYOUT;
    formatYear = formatYear;
    layout = computed(() => layoutTimeline(this.events(), this.viewport()));
    ariaLabel = computed(() => `Zeitachse ${formatYear(this.viewport().startYear)} bis ${formatYear(this.viewport().endYear)}, ` +
        `${this.layout().visibleCount} Ereignisse`);
    /** Hover-Text: Titel + Jahr(e) */
    tooltip(event) {
        const years = event.end
            ? `${formatYear(event.start.year)}–${formatYear(event.end.year)}`
            : formatYear(event.start.year);
        return `${event.title} (${years})`;
    }
    /** Maus-Pixel (clientX) → viewBox-Einheiten. jsdom liefert width 0 → Maßstab 1 (Tests). */
    clientXToViewBox(clientX) {
        const rect = this.svg().nativeElement.getBoundingClientRect();
        const scale = rect.width > 0 ? this.viewport().widthPx / rect.width : 1;
        return (clientX - rect.left) * scale;
    }
    onWheel(event) {
        event.preventDefault();
        const now = Date.now();
        this.wheelStreak = now - this.lastWheelAt < 250 ? this.wheelStreak + 1 : 0;
        this.lastWheelAt = now;
        const focusYear = xToYear(this.clientXToViewBox(event.clientX), this.viewport());
        const factor = wheelZoomFactor(event.deltaY, wheelBoost(this.wheelStreak));
        this.viewportChange.emit(zoomViewport(this.viewport(), focusYear, factor));
    }
    onPointerDown(event) {
        this.dragging.set(true);
        this.lastPointerX = event.clientX;
        this.movedPx = 0;
        this.svg().nativeElement.setPointerCapture(event.pointerId);
    }
    onPointerMove(event) {
        if (!this.dragging() || this.lastPointerX === null)
            return;
        this.movedPx += Math.abs(event.clientX - this.lastPointerX);
        const dx = this.clientXToViewBox(event.clientX) - this.clientXToViewBox(this.lastPointerX);
        this.lastPointerX = event.clientX;
        if (dx !== 0)
            this.viewportChange.emit(panViewport(this.viewport(), dx));
    }
    onPointerUp(event) {
        this.dragging.set(false);
        this.lastPointerX = null;
        this.svg().nativeElement.releasePointerCapture(event.pointerId);
    }
    wasDrag() {
        return this.movedPx > Timeline_1.CLICK_THRESHOLD_PX;
    }
    onMarkerClick(id, event) {
        event.stopPropagation(); // sonst feuert zusätzlich der Hintergrund-Klick
        if (!this.wasDrag())
            this.eventSelected.emit(id);
    }
    onBackgroundClick() {
        if (!this.wasDrag())
            this.eventSelected.emit(null);
    }
};
Timeline = Timeline_1 = __decorate([
    Component({
        selector: 'app-timeline',
        templateUrl: './timeline.html',
        styleUrl: './timeline.scss',
    })
], Timeline);
export { Timeline };
