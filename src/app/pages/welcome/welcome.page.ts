import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cafeOutline,
  arrowForwardOutline,
  logInOutline,
  sparklesOutline,
  restaurantOutline,
  receiptOutline,
} from 'ionicons/icons';

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

@Component({
  selector: 'app-welcome',
  templateUrl: 'welcome.page.html',
  styleUrls: ['welcome.page.scss'],
  imports: [IonContent, IonIcon, CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WelcomePage implements AfterViewInit, OnDestroy {
  @ViewChild('dust') private dustRef!: ElementRef<HTMLCanvasElement>;

  private ctx?: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private motes: Mote[] = [];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private reduce = false;
  private running = false;

  constructor(private router: Router) {
    addIcons({
      cafeOutline,
      arrowForwardOutline,
      logInOutline,
      sparklesOutline,
      restaurantOutline,
      receiptOutline,
    });
  }

  // --- Drifting gold dust ----------------------------------------------------

  ngAfterViewInit(): void {
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cv = this.dustRef.nativeElement;
    this.ctx = cv.getContext('2d') ?? undefined;

    this.resize();
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);

    if (this.reduce) {
      this.drawStatic();
    } else {
      this.start();
    }
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
    const cv = this.dustRef.nativeElement;
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

  // --- Enter interaction -----------------------------------------------------

  onEnter(event: Event): void {
    this.bloom(event);
    try {
      localStorage.setItem('cafe-welcome-seen', '1');
    } catch {
      // storage unavailable — proceed anyway
    }
    window.setTimeout(() => {
      this.router.navigateByUrl('/tabs/menu', { replaceUrl: true });
    }, 280);
  }

  /** Expanding ripple from the tap point — the "bloom". */
  private bloom(event: Event): void {
    const btn = (event.currentTarget as HTMLElement)?.closest('.enter') as HTMLElement | null;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ev = event as PointerEvent;
    const x = (ev.clientX || rect.left + rect.width / 2) - rect.left;
    const y = (ev.clientY || rect.top + rect.height / 2) - rect.top;
    const d = Math.max(rect.width, rect.height) * 2.2;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = `${d}px`;
    span.style.left = `${x - d / 2}px`;
    span.style.top = `${y - d / 2}px`;
    btn.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }
}
