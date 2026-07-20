import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category, MENU } from '../data/cafe-data';

// ========== TYPES ==========
export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  price: number;
  category: Category;
  rating?: number;
  featured?: boolean;
  tag?: string;
  image?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  emoji: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  tableNumber?: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export type PaymentMethod = 'card' | 'cash' | 'eft' | 'qr';

export interface Review {
  id: string;
  author: string;
  dishId: string;
  rating: number;
  comment: string;
  hidden: boolean;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
}

export type UserRole = 'customer' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface Flag {
  id: string;
  targetType: 'review' | 'comment' | 'user';
  targetId: string;
  reason: string;
  details?: string;
  reporter: string;
  status: FlagStatus;
  createdAt: string;
}

export type FlagStatus = 'open' | 'resolved' | 'dismissed';

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target?: string;
  createdAt: string;
}

export interface CartItem {
  price: any;
  qty: any;
  id: string;
  item: MenuItem;
  quantity: number;
}

export interface Profile {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  avatar?: string;
  phone?: string;
}

export interface AppSettings {
  notifications: { email: boolean; push: boolean; inApp: boolean };
  cookies: { analytics: boolean; marketing: boolean };
  language: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: { email: true, push: true, inApp: true },
  cookies: { analytics: true, marketing: false },
  language: 'en',
};

// ========== SERVICE ==========
@Injectable({
  providedIn: 'root'
})
export class CafeService {
  // ========== PRIVATE STATE ==========
  private _menuItems: MenuItem[] = [];
  private _orders: Order[] = [];
  private _reviews: Review[] = [];
  private _users: User[] = [];
  private _flags: Flag[] = [];
  private _auditLog: AuditLog[] = [];
  private _cart: CartItem[] = [];
  private _favorites: Set<string> = new Set();
  private _profile: Profile | null = null;
  private _settings: AppSettings = this.loadSettings();

  // ========== BEHAVIOR SUBJECTS (for reactive updates) ==========
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private profileSubject = new BehaviorSubject<Profile | null>(null);
  private settingsSubject = new BehaviorSubject<AppSettings>(this._settings);

  // ========== PUBLIC OBSERVABLES ==========
  cart$: Observable<CartItem[]> = this.cartSubject.asObservable();
  favorites$: Observable<string[]> = this.favoritesSubject.asObservable();
  orders$: Observable<Order[]> = this.ordersSubject.asObservable();
  profile$: Observable<Profile | null> = this.profileSubject.asObservable();
  settings$: Observable<AppSettings> = this.settingsSubject.asObservable();

  constructor() {
    this.initMockData();
    this.hydrateFromStorage();
    this.wirePersistence();
  }

  // ========== PERSISTENCE ==========
  private static readonly KEYS = {
    cart: 'cafe-cart',
    favorites: 'cafe-favorites',
    profile: 'cafe-profile',
    orders: 'cafe-orders',
    reviews: 'cafe-reviews',
  };

  private read<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage may be unavailable (private mode / quota)
    }
  }

  /** Load any previously-saved state over the seeded defaults. */
  private hydrateFromStorage(): void {
    const cart = this.read<CartItem[]>(CafeService.KEYS.cart);
    if (cart) {
      this._cart = cart;
      this.cartSubject.next([...this._cart]);
    }

    const favorites = this.read<string[]>(CafeService.KEYS.favorites);
    if (favorites) {
      this._favorites = new Set(favorites);
      this.favoritesSubject.next([...this._favorites]);
    }

    // Only override the profile when a session was explicitly saved.
    const savedProfile = localStorage.getItem(CafeService.KEYS.profile);
    if (savedProfile !== null) {
      this._profile = this.read<Profile | null>(CafeService.KEYS.profile);
      this.profileSubject.next(this._profile);
    }

    const orders = this.read<Order[]>(CafeService.KEYS.orders);
    if (orders) {
      this._orders = orders;
      this.ordersSubject.next([...this._orders]);
    }

    const reviews = this.read<Review[]>(CafeService.KEYS.reviews);
    if (reviews) {
      this._reviews = reviews;
    }
  }

  /** Persist each stream whenever it changes. */
  private wirePersistence(): void {
    this.cartSubject.subscribe((v) => this.write(CafeService.KEYS.cart, v));
    this.favoritesSubject.subscribe((v) => this.write(CafeService.KEYS.favorites, v));
    this.ordersSubject.subscribe((v) => this.write(CafeService.KEYS.orders, v));
    this.profileSubject.subscribe((v) => this.write(CafeService.KEYS.profile, v));
  }

  /** Reviews have no dedicated subject — call after any review mutation. */
  private persistReviews(): void {
    this.write(CafeService.KEYS.reviews, this._reviews);
  }

  // ========== INIT MOCK DATA ==========
  private initMockData() {
    // --- MENU (single source of truth, shared with the Menu & Reviews tabs) ---
    this._menuItems = MENU.map((m) => ({ ...m }));

    // --- PROFILE ---
    this._profile = {
      name: 'Lethabo',
      email: 'admin@cafe.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date().toISOString()
    };
    this.profileSubject.next(this._profile);

    // --- ORDERS ---
    this._orders = [
      {
        id: 'ORD-001',
        customer: 'John Doe',
        tableNumber: '1234',
        status: 'pending',
        total: 115,
        items: [
          { id: 'pbj', name: 'Peanut Butter & Jelly', emoji: '🥜', qty: 1, price: 60 },
          { id: 'cream', name: 'La Crème Brûlée', emoji: '🍮', qty: 1, price: 55 }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ORD-002',
        customer: 'Jane Smith',
        tableNumber: '5678',
        status: 'preparing',
        total: 70,
        items: [
          { id: 'prawn', name: 'Roasted Prawn', emoji: '🦐', qty: 1, price: 70 }
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'ORD-003',
        customer: 'Alice Johnson',
        tableNumber: '9012',
        status: 'ready',
        total: 130,
        items: [
          { id: 'halloumi-fries', name: 'Abi Halloumi Fries', emoji: '🍟', qty: 1, price: 49 },
          { id: 'truffle', name: 'Perfetto Truffle Fries', emoji: '🍟', qty: 1, price: 36 },
          { id: 'corn', name: 'I Love Corn & Cheese', emoji: '🌽', qty: 1, price: 45 }
        ],
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'ORD-004',
        customer: 'Lethabo',
        tableNumber: '1234',
        status: 'ready',
        paymentMethod: 'card',
        total: 103,
        items: [
          { id: 'waffle', name: 'Enchanted Waffle', emoji: '🧇', qty: 1, price: 45 },
          { id: 'pbj', name: 'Peanut Butter & Jelly', emoji: '🥜', qty: 1, price: 60 }
        ],
        createdAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'ORD-005',
        customer: 'Lethabo',
        status: 'pending',
        paymentMethod: 'cash',
        total: 70,
        items: [
          { id: 'prawn', name: 'Roasted Prawn', emoji: '🦐', qty: 1, price: 70 }
        ],
        createdAt: new Date().toISOString()
      }
    ];
    this.ordersSubject.next(this._orders);

    // --- REVIEWS ---
    this._reviews = [
      {
        id: 'rev-001',
        author: 'Amy',
        dishId: 'pbj',
        rating: 4.8,
        comment: 'Best coffee in town! The peanut butter & jelly is amazing!',
        hidden: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'rev-002',
        author: 'Ben',
        dishId: 'cream',
        rating: 4.5,
        comment: 'Cozy atmosphere, great service. The crème brûlée is to die for!',
        hidden: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'rev-003',
        author: 'Chloe',
        dishId: 'prawn',
        rating: 5.0,
        comment: "Lethabo's latte art is amazing! The roasted prawn was perfectly cooked.",
        hidden: false,
        createdAt: new Date().toISOString()
      }
    ];

    // --- USERS ---
    this._users = [
      {
        name: 'Lethabo',
        email: 'admin@cafe.com',
        role: 'admin',
        status: 'active',
        joinedAt: new Date().toISOString()
      },
      {
        name: 'John Customer',
        email: 'john@example.com',
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString()
      },
      {
        name: 'Jane Moderator',
        email: 'jane@mod.com',
        role: 'moderator',
        status: 'active',
        joinedAt: new Date().toISOString()
      },
      {
        name: 'Suspended User',
        email: 'suspended@example.com',
        role: 'customer',
        status: 'suspended',
        joinedAt: new Date().toISOString()
      }
    ];

    // --- FLAGS ---
    this._flags = [
      {
        id: 'flag-001',
        targetType: 'review',
        targetId: 'rev-002',
        reason: 'Spam content',
        details: 'Suspicious review pattern with multiple duplicate reviews',
        reporter: 'moderator1',
        status: 'open',
        createdAt: new Date().toISOString()
      }
    ];

    // --- AUDIT LOG ---
    this._auditLog = [
      {
        id: 'audit-001',
        action: 'User Login',
        actor: 'admin@cafe.com',
        target: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'audit-002',
        action: 'Order Status Updated',
        actor: 'admin@cafe.com',
        target: 'ORD-002',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    // --- FAVORITES (empty initially) ---
    this.favoritesSubject.next([]);
  }

  // ========== MENU METHODS ==========
  getMenu(): MenuItem[] {
    return [...this._menuItems];
  }

  getMenuItem(id: string): MenuItem | undefined {
    return this._menuItems.find(item => item.id === id);
  }

  getFeaturedItems(): MenuItem[] {
    return this._menuItems.filter(item => item.featured);
  }

  getItemsByCategory(category: Category): MenuItem[] {
    return this._menuItems.filter(item => item.category === category);
  }

  searchItems(query: string): MenuItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return this._menuItems;
    return this._menuItems.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    );
  }

  // ========== CART METHODS ==========
  getCart(): CartItem[] {
    return [...this._cart];
  }

  getCartTotal(): number {
    return this._cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
  }

  getCartCount(): number {
    return this._cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  addToCart(item: MenuItem, quantity: number = 1): void {
    const existing = this._cart.find(cartItem => cartItem.item.id === item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this._cart.push({
        item, quantity,
        price: undefined,
        qty: undefined,
        id: ''
      });
    }
    this.cartSubject.next([...this._cart]);
  }

  removeFromCart(itemId: string): void {
    this._cart = this._cart.filter(item => item.item.id !== itemId);
    this.cartSubject.next([...this._cart]);
  }

  updateCartQuantity(itemId: string, quantity: number): void {
    const existing = this._cart.find(item => item.item.id === itemId);
    if (existing) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        existing.quantity = quantity;
        this.cartSubject.next([...this._cart]);
      }
    }
  }

  clearCart(): void {
    this._cart = [];
    this.cartSubject.next([]);
  }

  // ========== FAVORITES METHODS ==========
  getFavorites(): string[] {
    return [...this._favorites];
  }

  getFavoriteItems(): MenuItem[] {
    return this._menuItems.filter(item => this._favorites.has(item.id));
  }

  isFavorite(itemId: string): boolean {
    return this._favorites.has(itemId);
  }

  toggleFavorite(itemId: string): void {
    if (this._favorites.has(itemId)) {
      this._favorites.delete(itemId);
    } else {
      this._favorites.add(itemId);
    }
    this.favoritesSubject.next([...this._favorites]);
  }

  addFavorite(itemId: string): void {
    this._favorites.add(itemId);
    this.favoritesSubject.next([...this._favorites]);
  }

  removeFavorite(itemId: string): void {
    this._favorites.delete(itemId);
    this.favoritesSubject.next([...this._favorites]);
  }

  // ========== ORDERS METHODS ==========
  getOrders(): Order[] {
    return [...this._orders];
  }

  getOrder(id: string): Order | undefined {
    return this._orders.find(order => order.id === id);
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this._orders.filter(order => order.status === status);
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: `ORD-${String(this._orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    this._orders.push(newOrder);
    this.ordersSubject.next([...this._orders]);
    this.addAuditLog('Order Created', this._profile?.email || 'system', newOrder.id);
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const order = this._orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.ordersSubject.next([...this._orders]);
      this.addAuditLog(`Order ${status}`, this._profile?.email || 'system', orderId);
    }
  }

  cancelOrder(orderId: string): void {
    this._orders = this._orders.filter(o => o.id !== orderId);
    this.ordersSubject.next([...this._orders]);
    this.addAuditLog('Order Cancelled', this._profile?.email || 'system', orderId);
  }

  // ========== REVIEWS METHODS ==========
  getReviews(): Review[] {
    return [...this._reviews];
  }

  getVisibleReviews(): Review[] {
    return this._reviews.filter(review => !review.hidden);
  }

  getReviewsByDish(dishId: string): Review[] {
    return this._reviews.filter(review => review.dishId === dishId);
  }

  getAverageRating(dishId: string): number {
    const reviews = this.getReviewsByDish(dishId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  }

  addReview(review: Omit<Review, 'id' | 'createdAt' | 'hidden'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev-${String(this._reviews.length + 1).padStart(3, '0')}`,
      hidden: false,
      createdAt: new Date().toISOString()
    };
    this._reviews.push(newReview);
    return newReview;
  }

  toggleReviewHidden(reviewId: string): void {
    const review = this._reviews.find(r => r.id === reviewId);
    if (review) {
      review.hidden = !review.hidden;
      this.addAuditLog(
        review.hidden ? 'Review Hidden' : 'Review Shown',
        this._profile?.email || 'system',
        reviewId
      );
    }
  }

  deleteReview(reviewId: string): void {
    this._reviews = this._reviews.filter(r => r.id !== reviewId);
    this.addAuditLog('Review Deleted', this._profile?.email || 'system', reviewId);
  }

  // ========== USERS METHODS ==========
  getUsers(): User[] {
    return [...this._users];
  }

  getUser(email: string): User | undefined {
    return this._users.find(user => user.email === email);
  }

  setUserRole(email: string, role: UserRole): void {
    const user = this._users.find(u => u.email === email);
    if (user) {
      user.role = role;
      this.addAuditLog(`User Role Updated to ${role}`, this._profile?.email || 'system', email);
    }
  }

  setUserStatus(email: string, status: UserStatus): void {
    const user = this._users.find(u => u.email === email);
    if (user) {
      user.status = status;
      this.addAuditLog(`User Status Updated to ${status}`, this._profile?.email || 'system', email);
    }
  }

  // ========== PROFILE METHODS ==========
  getProfile(): Profile | null {
    return this._profile ? { ...this._profile } : null;
  }

  updateProfile(changes: Partial<Profile>): Profile | null {
    if (!this._profile) return null;
    this._profile = { ...this._profile, ...changes };
    this.profileSubject.next({ ...this._profile });
    this.addAuditLog('Profile Updated', this._profile.email);
    return { ...this._profile };
  }

  isAdmin(): boolean {
    return this._profile?.role === 'admin';
  }

  isModerator(): boolean {
    return this._profile?.role === 'moderator' || this.isAdmin();
  }

  login(email: string, password: string): boolean {
    // Mock login - in real app, this would call an API
    const user = this._users.find(u => u.email === email);
    if (user && user.status === 'active') {
      this._profile = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joinedAt: user.joinedAt
      };
      this.profileSubject.next(this._profile);
      this.addAuditLog('User Login', email);
      return true;
    }
    return false;
  }

  register(name: string, email: string, _password: string): { ok: boolean; error?: string } {
    const normalized = email.trim().toLowerCase();
    if (this._users.some((u) => u.email.toLowerCase() === normalized)) {
      return { ok: false, error: 'An account with that email already exists' };
    }
    const user: User = {
      name: name.trim(),
      email: email.trim(),
      role: 'customer',
      status: 'active',
      joinedAt: new Date().toISOString(),
    };
    this._users.push(user);
    this._profile = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      joinedAt: user.joinedAt,
    };
    this.profileSubject.next({ ...this._profile });
    this.addAuditLog('Account Created', user.email);
    return { ok: true };
  }

  logout(): void {
    if (this._profile) {
      this.addAuditLog('User Logout', this._profile.email);
    }
    this._profile = null;
    this.profileSubject.next(null);
  }

  deleteAccount(): void {
    if (this._profile) {
      const email = this._profile.email;
      this._users = this._users.filter((u) => u.email !== email);
      this.addAuditLog('Account Deleted', email);
    }
    this._profile = null;
    this.profileSubject.next(null);
  }

  // ========== SETTINGS METHODS ==========
  private loadSettings(): AppSettings {
    try {
      const raw = localStorage.getItem('cafe-settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
          cookies: { ...DEFAULT_SETTINGS.cookies, ...parsed.cookies },
          language: parsed.language ?? DEFAULT_SETTINGS.language,
        };
      }
    } catch {
      // ignore malformed storage
    }
    return { ...DEFAULT_SETTINGS, notifications: { ...DEFAULT_SETTINGS.notifications }, cookies: { ...DEFAULT_SETTINGS.cookies } };
  }

  private persistSettings(): void {
    try {
      localStorage.setItem('cafe-settings', JSON.stringify(this._settings));
    } catch {
      // storage may be unavailable
    }
  }

  getSettings(): AppSettings {
    return {
      notifications: { ...this._settings.notifications },
      cookies: { ...this._settings.cookies },
      language: this._settings.language,
    };
  }

  updateSettings(changes: Partial<AppSettings>): void {
    this._settings = {
      notifications: { ...this._settings.notifications, ...changes.notifications },
      cookies: { ...this._settings.cookies, ...changes.cookies },
      language: changes.language ?? this._settings.language,
    };
    this.persistSettings();
    this.settingsSubject.next(this.getSettings());
  }

  resetSettings(): void {
    this._settings = {
      ...DEFAULT_SETTINGS,
      notifications: { ...DEFAULT_SETTINGS.notifications },
      cookies: { ...DEFAULT_SETTINGS.cookies },
    };
    this.persistSettings();
    this.settingsSubject.next(this.getSettings());
  }

  // ========== FLAGS METHODS ==========
  getFlags(): Flag[] {
    return [...this._flags];
  }

  getOpenFlags(): Flag[] {
    return this._flags.filter(flag => flag.status === 'open');
  }

  addFlag(flag: Omit<Flag, 'id' | 'createdAt' | 'status'>): Flag {
    const newFlag: Flag = {
      ...flag,
      id: `flag-${String(this._flags.length + 1).padStart(3, '0')}`,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    this._flags.push(newFlag);
    this.addAuditLog('Flag Created', this._profile?.email || 'system', newFlag.id);
    return newFlag;
  }

  resolveFlag(flagId: string, status: 'resolved' | 'dismissed'): void {
    const flag = this._flags.find(f => f.id === flagId);
    if (flag) {
      flag.status = status;
      this.addAuditLog(`Flag ${status}`, this._profile?.email || 'system', flagId);
    }
  }

  // ========== AUDIT LOG METHODS ==========
  getAuditLog(): AuditLog[] {
    return [...this._auditLog];
  }

  addAuditLog(action: string, actor: string, target?: string): void {
    this._auditLog.push({
      id: `audit-${String(this._auditLog.length + 1).padStart(3, '0')}`,
      action,
      actor,
      target,
      createdAt: new Date().toISOString()
    });
  }

  // ========== HELPER METHODS ==========
  formatPrice(price: number): string {
    return `R ${price.toFixed(2)}`;
  }

  // formatDate(date: string): string {
  //   return new Date(date).toLocaleString(undefined, {
  //     dateStyle: 'short',
  //     timeStyle: 'short'
  //   });
  // }
  formatDate(date: string): string {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short'
  } as any);
}


  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      morning: 'Morning',
      sharing: 'Sharing',
      salad: 'Salad'
    };
    return labels[category] || category;
  }

  // ========== RESET / CLEAR DATA (for testing) ==========
  resetData(): void {
    this._cart = [];
    this._favorites.clear();
    this.cartSubject.next([]);
    this.favoritesSubject.next([]);
    this.initMockData();
  }
}