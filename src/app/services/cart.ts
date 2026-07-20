// src/app/core/services/cart.service.ts

import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from './auth';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  imageUrl?: string;
  customizations?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // ==========================================
  // Mock Data - Pre-populated cart for testing
  // ==========================================

  private mockCart: CartItem[] = [
    { id: '8', name: 'Abi Halloumi Fries', price: 49, qty: 2, emoji: '🍟' },
    { id: '1', name: 'Peanut Butter & Jelly', price: 60, qty: 1, emoji: '🥜' }
  ];

  // ==========================================
  // State
  // ==========================================

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(private authService: AuthService) {
    // Load cart from localStorage or use mock
    const saved = localStorage.getItem('mockCart');
    if (saved) {
      try {
        this.cartSubject.next(JSON.parse(saved));
      } catch {
        this.cartSubject.next([...this.mockCart]);
      }
    } else {
      this.cartSubject.next([...this.mockCart]);
    }

    // Listen to auth changes - if user logs out, keep cart as guest
    this.authService.user$.subscribe(() => {
      // Cart persists regardless of auth state in mock mode
    });
  }

  // ==========================================
  // Computed Properties
  // ==========================================

  get total(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  get count(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.qty, 0);
  }

  get itemCount(): number {
    return this.cartSubject.value.length;
  }

  get isEmpty(): boolean {
    return this.cartSubject.value.length === 0;
  }

  // ==========================================
  // Methods
  // ==========================================

  /**
   * Add item to cart
   */
  addItem(item: CartItem): void {
    const current = this.cartSubject.value;
    const existing = current.find(
      i => i.id === item.id && i.customizations === item.customizations
    );
    
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      current.push({ ...item, qty: item.qty || 1 });
    }
    
    this.cartSubject.next([...current]);
    this.saveCart();
  }

  /**
   * Update quantity
   */
  updateQty(id: string, delta: number, customizations?: string): void {
    const current = this.cartSubject.value;
    const item = current.find(
      i => i.id === id && i.customizations === (customizations || '')
    );
    
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        this.cartSubject.next(
          current.filter(i => !(i.id === id && i.customizations === (customizations || '')))
        );
      } else {
        this.cartSubject.next([...current]);
      }
      this.saveCart();
    }
  }

  /**
   * Remove item
   */
  removeItem(id: string, customizations?: string): void {
    this.cartSubject.next(
      this.cartSubject.value.filter(
        i => !(i.id === id && i.customizations === (customizations || ''))
      )
    );
    this.saveCart();
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    this.cartSubject.next([]);
    this.saveCart();
  }

  /**
   * Save cart to localStorage
   */
  private saveCart(): void {
    localStorage.setItem('mockCart', JSON.stringify(this.cartSubject.value));
  }

  /**
   * Get cart as observable
   */
  getCart(): Observable<CartItem[]> {
    return this.cart$.pipe(delay(100));
  }

  /**
   * Check if item exists in cart
   */
  hasItem(id: string, customizations?: string): boolean {
    return this.cartSubject.value.some(
      i => i.id === id && i.customizations === (customizations || '')
    );
  }

  /**
   * Get item quantity
   */
  getItemQty(id: string, customizations?: string): number {
    const item = this.cartSubject.value.find(
      i => i.id === id && i.customizations === (customizations || '')
    );
    return item?.qty || 0;
  }

  /**
   * Reset cart to mock data (for testing)
   */
  resetCart(): void {
    this.cartSubject.next([...this.mockCart]);
    this.saveCart();
  }
}