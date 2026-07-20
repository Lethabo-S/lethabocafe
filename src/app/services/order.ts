// src/app/core/services/order.service.ts

import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { UserService } from './user';
import { AuthService } from './auth';
import { TableService } from './table';
import { CartItem, CartService } from './cart';

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  deliveryMethod: 'dine-in' | 'takeaway' | 'delivery';
  table?: number;
  deliveryAddress?: string;
  createdAt: Date;
  isGuest?: boolean;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // ==========================================
  // Mock Data
  // ==========================================

  private mockOrders: Order[] = [
    {
      id: 'ord_mock_001',
      userId: 'mock_uid_123',
      items: [
        { id: '8', name: 'Abi Halloumi Fries', price: 49, qty: 2, emoji: '🍟' }
      ],
      total: 98,
      status: 'completed',
      deliveryMethod: 'dine-in',
      table: 5,
      createdAt: new Date('2025-06-01T18:30:00'),
      paymentStatus: 'paid'
    },
    {
      id: 'ord_mock_002',
      userId: 'mock_uid_123',
      items: [
        { id: '1', name: 'Peanut Butter & Jelly', price: 60, qty: 1, emoji: '🥜' },
        { id: '5', name: 'Agapi', price: 45, qty: 1, emoji: '🥣' }
      ],
      total: 105,
      status: 'completed',
      deliveryMethod: 'takeaway',
      createdAt: new Date('2025-06-03T12:15:00'),
      paymentStatus: 'paid'
    },
    {
      id: 'ord_mock_003',
      userId: 'mock_uid_123',
      items: [
        { id: '9', name: 'Roasted Prawn', price: 70, qty: 1, emoji: '🦐' }
      ],
      total: 70,
      status: 'preparing',
      deliveryMethod: 'dine-in',
      table: 3,
      createdAt: new Date('2025-06-05T19:45:00'),
      paymentStatus: 'pending'
    }
  ];

  // ==========================================
  // State
  // ==========================================

  private ordersSubject = new BehaviorSubject<Order[]>([...this.mockOrders]);
  orders$ = this.ordersSubject.asObservable();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private tableService: TableService,
    private userService: UserService
  ) {}

  // ==========================================
  // Place Order
  // ==========================================

  /**
   * Place a new order (mock)
   */
  async placeOrder(
    items: CartItem[],
    total: number,
    method: string = 'dine-in',
    table?: number,
    address?: string,
    isGuest: boolean = false
  ): Promise<string> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.authService.getCurrentUser();
        const userId = isGuest ? 'guest_' + Date.now() : (user?.uid || 'unknown_user');

        const order: Order = {
          id: 'ord_' + Date.now(),
          userId,
          items,
          total,
          status: 'pending',
          deliveryMethod: method as any,
          table: table || this.tableService.getTable() || 0,
          deliveryAddress: address || '',
          createdAt: new Date(),
          isGuest,
          paymentStatus: 'pending'
        };

        // Add to mock orders
        const current = this.ordersSubject.value;
        this.ordersSubject.next([order, ...current]);

        // If logged in, add to user orders and update points
        if (!isGuest && user) {
          this.userService.updatePoints(Math.floor(total / 10));
        }

        resolve(order.id!);
      }, 800);
    });
  }

  /**
   * Place order with points redemption (mock)
   */
  async placeOrderWithPoints(
    items: CartItem[],
    total: number,
    method: string = 'dine-in',
    table?: number,
    address?: string,
    usePoints: boolean = false,
    pointsToRedeem: number = 0
  ): Promise<{ orderId: string; discount: number; finalTotal: number }> {
    let discount = 0;
    let finalTotal = total;

    if (usePoints && pointsToRedeem > 0) {
      const currentProfile = this.userService.getCurrentProfile();
      if (currentProfile && currentProfile.points >= pointsToRedeem) {
        discount = await this.userService.redeemPoints(pointsToRedeem);
        finalTotal = Math.max(0, total - discount);
      }
    }

    const orderId = await this.placeOrder(items, finalTotal, method, table, address);
    return { orderId, discount, finalTotal };
  }

  // ==========================================
  // Get Orders
  // ==========================================

  /**
   * Get orders for the current user (mock)
   */
  async getOrdersForUser(): Promise<Order[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return [];

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = this.ordersSubject.value.filter(o => o.userId === user.uid);
        resolve(orders);
      }, 300);
    });
  }

  /**
   * Get all orders (admin only - mock)
   */
  async getAllOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.ordersSubject.value);
      }, 300);
    });
  }

  /**
   * Get a single order by ID (mock)
   */
  async getOrder(orderId: string): Promise<Order | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.ordersSubject.value.find(o => o.id === orderId);
        resolve(order || null);
      }, 200);
    });
  }

  /**
   * Get orders for a guest
   */
  async getGuestOrders(guestId: string): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = this.ordersSubject.value.filter(o => o.userId === guestId);
        resolve(orders);
      }, 300);
    });
  }

  /**
   * Listen to real-time order updates (mock)
   */
  getOrderUpdates(orderId: string): Observable<Order> {
    return new Observable(subscriber => {
      const checkOrder = () => {
        const order = this.ordersSubject.value.find(o => o.id === orderId);
        if (order) {
          subscriber.next(order);
        }
      };
      
      // Initial check
      checkOrder();
      
      // Simulate updates every 5 seconds (for demo)
      const interval = setInterval(checkOrder, 5000);
      
      return () => clearInterval(interval);
    });
  }

  // ==========================================
  // Update Order
  // ==========================================

  /**
   * Update order status (mock)
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.ordersSubject.value;
        const updated = current.map(order => {
          if (order.id === orderId) {
            return { ...order, status };
          }
          return order;
        });
        this.ordersSubject.next(updated);
        resolve();
      }, 300);
    });
  }

  /**
   * Update payment status (mock)
   */
  async updatePaymentStatus(orderId: string, paymentStatus: 'pending' | 'paid' | 'failed'): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.ordersSubject.value;
        const updated = current.map(order => {
          if (order.id === orderId) {
            return { ...order, paymentStatus };
          }
          return order;
        });
        this.ordersSubject.next(updated);
        resolve();
      }, 300);
    });
  }

  /**
   * Cancel an order (customer)
   */
  async cancelOrder(orderId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be cancelled');
    }
    await this.updateOrderStatus(orderId, 'cancelled');
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Get status badge color
   */
  getStatusColor(status: Order['status']): string {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'tertiary';
      case 'ready': return 'success';
      case 'completed': return 'medium';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: Order['status']): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  /**
   * Reset mock data (for testing)
   */
  resetMockOrders() {
    this.ordersSubject.next([...this.mockOrders]);
  }

  /**
   * Add mock order (for testing)
   */
  addMockOrder(order: Order) {
    const current = this.ordersSubject.value;
    this.ordersSubject.next([order, ...current]);
  }
}