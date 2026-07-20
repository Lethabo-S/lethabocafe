import { Injectable, signal, computed } from '@angular/core';

export type CouponKind = 'percent' | 'fixed' | 'freeItem';
export type CouponCategory = 'order' | 'dessert' | 'coffee' | 'delivery';

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  kind: CouponKind;
  /** percent → 15 (15%); fixed → 50 (R50); freeItem → price of the free item */
  value: number;
  /** ISO date the coupon stops working */
  expires: string;
  category: CouponCategory;
  terms: string;
  /** minimum cart total required for the coupon to apply */
  minSpend?: number;
  featured?: boolean;
}

/**
 * Mock coupon store. In production this would be fetched from a promos API
 * and gated by the member's tier; here the data is seeded and mutated
 * in-memory via signals so the Offers page and the cart stay in sync.
 */
const MOCK: Coupon[] = [
  {
    id: 'c-1',
    code: 'WELCOME20',
    title: '20% off your first order',
    description: 'A warm welcome to the table — 20% off everything on your first order with us.',
    kind: 'percent',
    value: 20,
    expires: '2026-08-15',
    category: 'order',
    terms: 'First order only. Cannot combine with other offers.',
    featured: true,
  },
  {
    id: 'c-2',
    code: 'DESSERTFREE',
    title: 'Free dessert with any main',
    description: 'Order any main plate and we’ll add a sweet thing on the house.',
    kind: 'freeItem',
    value: 55,
    expires: '2026-07-25',
    category: 'dessert',
    terms: 'One free dessert per table. Cheapest dessert free.',
  },
  {
    id: 'c-3',
    code: 'ROSE50',
    title: 'R50 off orders over R200',
    description: 'Treat the table — knock R50 off once your order reaches R200.',
    kind: 'fixed',
    value: 50,
    expires: '2026-07-30',
    category: 'order',
    minSpend: 200,
    terms: 'Minimum spend R200. Excludes service.',
  },
  {
    id: 'c-4',
    code: 'COFFEE2',
    title: 'Buy 1 get 1 free coffee',
    description: 'Bring a friend — your second cup of house coffee is on us.',
    kind: 'freeItem',
    value: 45,
    expires: '2026-07-22',
    category: 'coffee',
    terms: 'House coffee only. Dine-in.',
  },
  {
    id: 'c-5',
    code: 'BRAAI15',
    title: '15% off braai platters',
    description: 'Fire up the weekend — 15% off any sharing braai platter.',
    kind: 'percent',
    value: 15,
    expires: '2026-07-20',
    category: 'order',
    terms: 'Braai platter category only.',
  },
  {
    id: 'c-6',
    code: 'SWEET10',
    title: 'R10 off any sweet',
    description: 'A little something sweet — R10 off any dessert or pastry.',
    kind: 'fixed',
    value: 10,
    expires: '2026-07-19',
    category: 'dessert',
    terms: 'One per order.',
  },
  {
    id: 'c-7',
    code: 'SPRING25',
    title: 'Spring fling 25% off',
    description: 'Our spring launch special — 25% off the whole carte.',
    kind: 'percent',
    value: 25,
    expires: '2026-07-10',
    category: 'order',
    terms: 'Seasonal. Expired.',
  },
];

const DAY_MS = 86_400_000;

@Injectable({ providedIn: 'root' })
export class CouponService {
  private _coupons = signal<Coupon[]>(MOCK.map((c) => ({ ...c })));
  readonly coupons = this._coupons.asReadonly();

  private _saved = signal<Set<string>>(new Set());
  readonly savedIds = this._saved.asReadonly();

  private _activeCode = signal<string | null>(null);
  readonly activeCode = this._activeCode.asReadonly();
  readonly activeCoupon = computed(() =>
    this._activeCode()
      ? this._coupons().find((c) => c.code === this._activeCode()) ?? null
      : null,
  );

  isSaved(id: string): boolean {
    return this._saved().has(id);
  }

  toggleSave(id: string): void {
    this._saved.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /** Choose a coupon to apply at checkout. */
  apply(code: string): void {
    if (this._coupons().some((c) => c.code === code)) {
      this._activeCode.set(code);
    }
  }

  clearActive(): void {
    this._activeCode.set(null);
  }

  isExpired(coupon: Coupon): boolean {
    return Date.now() > new Date(coupon.expires).getTime();
  }

  /** Whole days until expiry (negative once expired). */
  daysLeft(coupon: Coupon): number {
    const ms = new Date(coupon.expires).getTime() - Date.now();
    return Math.ceil(ms / DAY_MS);
  }

  /** Numeric saving for a given cart total, or 0 if not applicable. */
  discountFor(coupon: Coupon, total: number): number {
    if (this.isExpired(coupon)) return 0;
    if (coupon.minSpend && total < coupon.minSpend) return 0;
    if (coupon.kind === 'percent') return Math.round((total * coupon.value) / 100);
    if (coupon.kind === 'fixed' || coupon.kind === 'freeItem') {
      return Math.min(coupon.value, total);
    }
    return 0;
  }
}
