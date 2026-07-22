import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IonIcon, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  restaurant,
  restaurantOutline,
  star,
  starOutline,
  qrCode,
  qrCodeOutline,
  bag,
  bagOutline,
  personCircle,
  personCircleOutline,
  notifications,
  notificationsOutline,
} from 'ionicons/icons';
import { CafeService } from 'src/app/services/cafe';
import { NotificationService } from 'src/app/services/notification';

interface Tab {
  route: string;
  label: string;
  icon: string;
  iconOutline: string;
}

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule, IonIcon, IonBadge],
  template: `
    <nav class="tab-bar" role="tablist" aria-label="Primary">
      <button
        *ngFor="let tab of tabs"
        type="button"
        class="tab"
        role="tab"
        [class.active]="isActive(tab.route)"
        [attr.aria-selected]="isActive(tab.route)"
        [attr.aria-label]="tab.label"
        (click)="navigate(tab.route)"
      >
        <span class="dot" aria-hidden="true"></span>
        <span class="icon-wrap">
          <span class="pill" aria-hidden="true"></span>
          <ion-icon [name]="isActive(tab.route) ? tab.icon : tab.iconOutline"></ion-icon>
          <ion-badge *ngIf="tab.route === cartRoute && cartCount() > 0" class="badge">
            {{ cartCount() }}
          </ion-badge>
          <ion-badge *ngIf="tab.route === notificationsRoute && ns.unreadCount() > 0" class="badge">
            {{ ns.unreadCount() }}
          </ion-badge>
        </span>
        <span class="label">{{ tab.label }}</span>
      </button>
    </nav>
  `,
  styles: [
    `
      :host {
          --tb-hair: #7a6a6a;       /* muted espresso accent */
          --tb-rose: #b82a21;       /* deep rose-brown */
          --tb-rose-tint: #d96266;  /* light rose tint */
        --tb-gold: var(--gold);
        --font-ui: 'Hanken Grotesk', system-ui, -apple-system, sans-serif;
        display: block;
      }

      .tab-bar {
        position: relative;
        display: flex;
        align-items: stretch;
        gap: 2px;
        padding: 9px 6px calc(9px + env(safe-area-inset-bottom, 0px));
        background: color-mix(in oklch, var(--card) 80%, transparent);
        backdrop-filter: blur(22px) saturate(1.3);
        -webkit-backdrop-filter: blur(22px) saturate(1.3);
        border-top: 1px solid var(--tb-hair);
        box-shadow: 0 -6px 24px rgba(61, 10, 5, 0.06);
      }

      /* Hairline gold accent along the top edge */
      .tab-bar::before {
        content: '';
        position: absolute;
        top: -1px;
        left: 12%;
        right: 12%;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in oklch, var(--gold) 55%, transparent),
          transparent
        );
        pointer-events: none;
      }

      .tab {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 6px 0 2px;
        border: none;
        background: transparent;
        color: var(--muted-foreground);
        font-family: var(--font-ui);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: color 0.2s ease;
      }

      .dot {
        position: absolute;
        top: -1px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--gold);
        opacity: 0;
        transform: scale(0);
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.4);
      }

      .icon-wrap {
        position: relative;
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
      }

      /* Rose pill that blooms behind the active icon */
      .pill {
        position: absolute;
        inset: 50% 50% auto auto;
        width: 46px;
        height: 30px;
        border-radius: 999px;
        background: var(--tb-rose-tint);
        border: 1px solid color-mix(in oklch, var(--rose) 26%, transparent);
        transform: translate(50%, -50%) scale(0.5);
        opacity: 0;
        transition: opacity 0.28s ease, transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.4);
        pointer-events: none;
        z-index: 0;
      }

      .tab ion-icon {
        position: relative;
        z-index: 1;
        font-size: 23px;
        transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.2s ease;
      }

      .label {
        font-size: 10.5px;
        font-weight: 500;
        letter-spacing: 0.01em;
        transition: font-weight 0.15s ease;
      }

      /* Active state */
      .tab.active {
        color: var(--tb-rose);
      }
      .tab.active .dot {
        opacity: 1;
        transform: scale(1);
      }
      .tab.active ion-icon {
        transform: translateY(-1px);
      }
      .tab.active .pill {
        opacity: 1;
        transform: translate(50%, -50%) scale(1);
      }
      .tab.active .label {
        font-weight: 700;
      }

      /* Press feedback */
      .tab:active ion-icon {
        transform: scale(0.84);
      }

      /* Cart badge */
      .badge {
        position: absolute;
        top: -5px;
        right: -9px;
        min-width: 17px;
        height: 17px;
        padding: 0 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: var(--tb-rose);
        color: #fff;
        font-family: var(--font-ui);
        font-size: 10px;
        font-weight: 700;
        line-height: 1;
        border: 2px solid var(--card);
        animation: badge-pop 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.5);
      }

      @keyframes badge-pop {
        0% { transform: scale(0); }
        60% { transform: scale(1.25); }
        100% { transform: scale(1); }
      }

      @media (prefers-reduced-motion: reduce) {
        .dot,
        .pill,
        .tab ion-icon,
        .badge {
          transition: none;
          animation: none;
        }
      }
    `,
  ],
})
export class TabBarComponent implements OnDestroy {
  readonly cartRoute = '/tabs/cart';
  readonly notificationsRoute = '/tabs/notifications';

  tabs: Tab[] = [
    { route: '/tabs/menu', label: 'Menu', icon: 'restaurant', iconOutline: 'restaurant-outline' },
    { route: '/tabs/reviews', label: 'Reviews', icon: 'star', iconOutline: 'star-outline' },
    { route: '/tabs/scan', label: 'Scan', icon: 'qr-code', iconOutline: 'qr-code-outline' },
    { route: '/tabs/cart', label: 'Cart', icon: 'bag', iconOutline: 'bag-outline' },
    { route: '/tabs/me', label: 'Me', icon: 'person-circle', iconOutline: 'person-circle-outline' },
    { route: '/tabs/notifications', label: 'Alerts', icon: 'notifications', iconOutline: 'notifications-outline' },
  ];

  currentRoute = signal('/tabs/menu');
  cartCount = signal(0);

  private subs = new Subscription();

  constructor(
    private router: Router,
    private cafeService: CafeService,
    public ns: NotificationService,
  ) {
    addIcons({
      restaurant,
      restaurantOutline,
      star,
      starOutline,
      qrCode,
      qrCodeOutline,
      bag,
      bagOutline,
      personCircle,
      personCircleOutline,
      notifications,
      notificationsOutline,
    });

    this.currentRoute.set(this.router.url);
    this.subs.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => this.currentRoute.set(e.urlAfterRedirects || e.url)),
    );

    this.subs.add(
      this.cafeService.cart$.subscribe(() => this.cartCount.set(this.cafeService.getCartCount())),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  isActive(route: string): boolean {
    const current = this.currentRoute();
    if (route === '/tabs/menu') {
      // Menu is also the active tab for the bare tabs root and the app root.
      return (
        current === '/' ||
        current === '/tabs' ||
        current === '/tabs/menu' ||
        current.startsWith('/tabs/menu/')
      );
    }
    // Match only at a segment boundary (route + '/' or exact), so that
    // '/tabs/me' is NOT treated as active while on '/tabs/menu'.
    return current === route || current.startsWith(route + '/');
  }

  navigate(route: string): void {
    if (this.isActive(route)) return;
    this.router.navigateByUrl(route);
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  }
}
