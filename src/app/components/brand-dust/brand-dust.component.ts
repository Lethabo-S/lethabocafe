import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';

interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  a: number;
  rose: boolean;
}

/**
 * Reusable "drifting gold dust" atmosphere layer.
 * Drop <app-brand-dust> inside an ion-content (behind the inner content) to
 * share the welcome hero's floating-mote backdrop across other screens.
 */

@Component({
  selector: 'app-brand-dust',
  templateUrl: './brand-dust.component.html',
  styleUrls: ['./brand-dust.component.scss'],
})
export class BrandDustComponent {
   @ViewChild('cv') private cvRef!: ElementRef<HTMLCanvasElement>;

  constructor(private zone: NgZone) {}

  private ctx?: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private motes: Mote[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private reduce = false;
  private running = false;

  ngAfterViewInit(): void {
    // Run the canvas animation loop outside Angular's zone: zone.js patches
    // requestAnimationFrame, so an in-zone loop would trigger full change
    // detection ~60×/sec, which rebuilds getter-derived *ngFor lists and
    // restarts their entrance animations (causing invisible/flickering items).
    this.zone.runOutsideAngular(() => {
      this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cv = this.cvRef.nativeElement;
      this.ctx = cv.getContext('2d') ?? undefined;

      this.resize();
      window.addEventListener('resize', this.onResize);
      document.addEventListener('visibilitychange', this.onVisibility);

      if (this.reduce) {
        this.drawStatic();
      } else {
        this.start();
      }
    });
  }

  ngOnDestroy(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private onResize = (): void => {
    this.resize();
    if (this.reduce) this.drawStatic();
  };

  private onVisibility = (): void => {
    if (document.hidden) this.stop();
    else if (!this.reduce) this.start();
  };

  private resize(): void {
    const cv = this.cvRef.nativeElement;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    cv.width = Math.max(1, this.w * this.dpr);
    cv.height = Math.max(1, this.h * this.dpr);
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seed();
  }

  private seed(): void {
    const count = Math.max(26, Math.min(72, Math.round((this.w * this.h) / 13000)));
    this.motes = Array.from({ length: count }, () => this.spawn());
  }

  private spawn(): Mote {
    return {
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.008 + Math.random() * 0.03,
      sway: 0.004 + Math.random() * 0.018,
      phase: Math.random() * Math.PI * 2,
      a: 0.22 + Math.random() * 0.5,
      rose: Math.random() < 0.16,
    };
  }

  private drawMote(p: Mote, t: number): void {
    if (!this.ctx) return;
    const tw = 0.55 + 0.45 * Math.sin(t * 0.001 + p.phase);
    this.ctx.globalAlpha = p.a * tw;
    const color = p.rose ? '194,120,122' : '216,176,96';
    const rad = p.r * 3;
    const g = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
    g.addColorStop(0, `rgba(${color},1)`);
    g.addColorStop(1, `rgba(${color},0)`);
    this.ctx.fillStyle = g;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private frame = (t: number): void => {
    if (!this.ctx) return;
    const dt = this.last ? Math.min(t - this.last, 48) : 16;
    this.last = t;
    this.ctx.clearRect(0, 0, this.w, this.h);
    for (const p of this.motes) {
      p.y -= p.vy * dt;
      p.x += Math.sin(t * 0.0006 + p.phase) * p.sway * dt;
      if (p.y < -12) {
        p.y = this.h + 12;
        p.x = Math.random() * this.w;
      }
      this.drawMote(p, t);
    }
    this.ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this.frame);
  };

  private drawStatic(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.w, this.h);
    for (const p of this.motes) this.drawMote(p, 0);
    this.ctx.globalAlpha = 1;
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}
