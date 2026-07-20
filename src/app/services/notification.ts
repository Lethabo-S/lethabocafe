import { Injectable, signal, computed } from '@angular/core';

export type NotificationType =
  | 'order-ready'
  | 'review-reply'
  | 'promo'
  | 'loyalty'
  | 'waiter'
  | 'system'
  | 'payment'
  | 'reservation';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

/**
 * Mock notification store. In production this would be backed by a real
 * push/FCM source; here the data is seeded and mutated in-memory via signals
 * so the tab bar badge and the page stay in sync.
 */
const MOCK: AppNotification[] = [
  {
    id: 'n-1',
    type: 'order-ready',
    title: 'Order #FR-204 is ready',
    message: 'Your cappuccino & rose tart are waiting at the counter.',
    time: '2m ago',
    read: false,
  },
  {
    id: 'n-2',
    type: 'review-reply',
    title: 'The kitchen replied',
    message: 'Chef Lethabo: “So glad you loved the bobotie — thank you!”',
    time: '1h ago',
    read: false,
  },
  {
    id: 'n-3',
    type: 'promo',
    title: 'Weekend special unlocked',
    message: 'Buy 1 braai platter, get a dessert free — till Sunday.',
    time: '3h ago',
    read: false,
  },
  {
    id: 'n-4',
    type: 'loyalty',
    title: 'You earned 120 points',
    message: "That's 60% to your next free coffee. Keep savouring!",
    time: '5h ago',
    read: true,
  },
  {
    id: 'n-5',
    type: 'waiter',
    title: 'Table help is on the way',
    message: 'Your call for extra napkins is with your server.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n-6',
    type: 'payment',
    title: 'Payment received',
    message: 'R184.00 via SnapScan — receipt is on its way to your email.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n-7',
    type: 'reservation',
    title: 'Table booked',
    message: 'Window seat for 2 on Sat 7:00pm is confirmed.',
    time: '2d ago',
    read: true,
  },
  {
    id: 'n-8',
    type: 'system',
    title: 'Menu refreshed',
    message: 'We added 4 new summer plates. Tap Menu to explore them.',
    time: '3d ago',
    read: true,
  },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _items = signal<AppNotification[]>(MOCK.map((n) => ({ ...n })));
  readonly items = this._items.asReadonly();
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read).length);

  markRead(id: string): void {
    this._items.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  markAllRead(): void {
    this._items.update((list) =>
      list.map((n) => (n.read ? n : { ...n, read: true })),
    );
  }

  remove(id: string): void {
    this._items.update((list) => list.filter((n) => n.id !== id));
  }

  clearAll(): void {
    this._items.set([]);
  }
}
