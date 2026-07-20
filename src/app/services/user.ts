// src/app/core/services/user.service.ts

import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AuthService } from './auth';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // ==========================================
  // Mock Data
  // ==========================================

  private mockProfile: UserProfile = {
    uid: 'mock_uid_123',
    name: 'Lethabo',
    email: 'lethabo@example.com',
    points: 450,
    tier: 'Silver',
    totalOrders: 12,
    totalSpent: 680,
    createdAt: new Date('2024-01-15'),
    avatar: 'https://i.pravatar.cc/150?u=lethabo'
  };

  private mockOrderHistory = [
    {
      id: 'ord_001',
      items: [
        { id: '8', name: 'Abi Halloumi Fries', price: 49, qty: 2, emoji: '🍟' }
      ],
      total: 98,
      status: 'completed',
      createdAt: new Date('2025-06-01T18:30:00'),
      deliveryMethod: 'dine-in'
    },
    {
      id: 'ord_002',
      items: [
        { id: '1', name: 'Peanut Butter & Jelly', price: 60, qty: 1, emoji: '🥜' },
        { id: '5', name: 'Agapi', price: 45, qty: 1, emoji: '🥣' }
      ],
      total: 105,
      status: 'completed',
      createdAt: new Date('2025-06-03T12:15:00'),
      deliveryMethod: 'takeaway'
    },
    {
      id: 'ord_003',
      items: [
        { id: '9', name: 'Roasted Prawn', price: 70, qty: 1, emoji: '🦐' }
      ],
      total: 70,
      status: 'preparing',
      createdAt: new Date('2025-06-05T19:45:00'),
      deliveryMethod: 'dine-in'
    }
  ];

  // ==========================================
  // State
  // ==========================================

  private profileSubject = new BehaviorSubject<UserProfile | null>(this.mockProfile);
  userProfile$ = this.profileSubject.asObservable();

  private ordersSubject = new BehaviorSubject<any[]>(this.mockOrderHistory);
  orders$ = this.ordersSubject.asObservable();

  constructor(private authService: AuthService) {
    // Listen to auth changes
    this.authService.user$.subscribe((user: any) => {
      if (!user) {
        this.profileSubject.next(null);
      } else {
        // In mock mode, we keep the same profile
        // In real app, would fetch from Firestore
        this.profileSubject.next(this.mockProfile);
      }
    });
  }

  // ==========================================
  // Methods
  // ==========================================

  /**
   * Get the current user profile
   */
  getCurrentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  /**
   * Get user profile as observable
   */
  getUserProfile(): Observable<UserProfile | null> {
    return this.userProfile$;
  }

  /**
   * Update user points and order stats (mock)
   */
  async updatePoints(pointsEarned: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.profileSubject.value;
        if (current) {
          const updated: UserProfile = {
            ...current,
            points: current.points + pointsEarned,
            totalOrders: current.totalOrders + 1,
            totalSpent: current.totalSpent + (pointsEarned * 10)
          };
          // Update tier
          updated.tier = this.getTier(updated.points);
          this.profileSubject.next(updated);
        }
        resolve();
      }, 300);
    });
  }

  /**
   * Redeem points for discount (mock)
   */
  async redeemPoints(pointsToRedeem: number): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.profileSubject.value;
        if (current && current.points >= pointsToRedeem) {
          const updated: UserProfile = {
            ...current,
            points: current.points - pointsToRedeem
          };
          this.profileSubject.next(updated);
          resolve(pointsToRedeem / 10); // Return discount amount
        }
        resolve(0);
      }, 300);
    });
  }

  /**
   * Update user profile (mock)
   */
  async updateProfile(data: Partial<UserProfile>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.profileSubject.value;
        if (current) {
          this.profileSubject.next({ ...current, ...data });
        }
        resolve();
      }, 300);
    });
  }

  /**
   * Get user orders (mock)
   */
  getOrders(): Observable<any[]> {
    return this.orders$.pipe(
      delay(300)
    );
  }

  /**
   * Add a new order (mock)
   */
  addOrder(order: any): void {
    const current = this.ordersSubject.value;
    this.ordersSubject.next([order, ...current]);
  }

  /**
   * Get points earned from an order total
   */
  calculatePoints(total: number): number {
    return Math.floor(total / 10);
  }

  /**
   * Get discount from points (1 point = 0.1 AED)
   */
  pointsToDiscount(points: number): number {
    return points / 10;
  }

  /**
   * Get tier based on points
   */
  getTier(points: number): 'Bronze' | 'Silver' | 'Gold' {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  }

  /**
   * Get points needed for next tier
   */
  getPointsToNextTier(points: number): number {
    if (points >= 1000) return 0;
    if (points >= 500) return 1000 - points;
    return 500 - points;
  }

  /**
   * Get tier progress percentage
   */
  getTierProgress(points: number): number {
    if (points >= 1000) return 100;
    if (points >= 500) return ((points - 500) / 500) * 100;
    return (points / 500) * 100;
  }

  /**
   * Reset profile (for testing)
   */
  resetProfile() {
    this.profileSubject.next(this.mockProfile);
  }

  /**
   * Set mock profile (for testing)
   */
  setMockProfile(profile: UserProfile) {
    this.profileSubject.next(profile);
  }
}