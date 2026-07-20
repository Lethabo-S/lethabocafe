import { Directive, HostListener, ElementRef } from '@angular/core';

/**
 * [appBloom] adds a soft "bloom" ripple from the exact tap point on any
 * element (buttons, links). Pairs with a CSS :active glow to make a rose
 * pill feel like it blossoms when pressed. Respects reduced-motion.
 */
@Directive({
  selector: '[appBloom]',
  standalone: true,
  host: {
    style: 'position: relative; overflow: hidden;',
  },
})
export class BloomDirective {
  private reduce = false;

  constructor(private el: ElementRef<HTMLElement>) {
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  @HostListener('click', ['$event'])
  onClick(event: PointerEvent): void {
    if (this.reduce) return;
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    const x = (event.clientX || rect.left + rect.width / 2) - rect.left;
    const y = (event.clientY || rect.top + rect.height / 2) - rect.top;
    const d = Math.max(rect.width, rect.height) * 2.2;

    const ripple = document.createElement('span');
    Object.assign(ripple.style, {
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
      width: `${d}px`,
      height: `${d}px`,
      left: `${x - d / 2}px`,
      top: `${y - d / 2}px`,
      background: 'radial-gradient(circle, rgba(255,255,255,0.5), rgba(255,255,255,0) 70%)',
      transform: 'scale(0)',
      animation: 'bloom-ripple 0.6s ease-out forwards',
    } as Partial<CSSStyleDeclaration>);

    host.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }
}
