import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  receiptOutline,
  flashOutline,
  cashOutline,
  flagOutline,
  starOutline,
  peopleOutline,
  chevronForward,
  shieldOutline,
  personOutline,
  restaurantOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { CafeService, Order, OrderStatus } from 'src/app/services/cafe';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: 'admin-dashboard.page.html',
  styleUrls: ['admin-dashboard.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    CommonModule,
    RouterLink,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  orderStatuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

  reviewsCount = 0;
  openFlagsCount = 0;
  usersCount = 0;

  private sub?: Subscription;

  constructor(
    public cafeService: CafeService,
    private router: Router,
  ) {
    addIcons({
      logOutOutline,
      receiptOutline,
      flashOutline,
      cashOutline,
      flagOutline,
      starOutline,
      peopleOutline,
      chevronForward,
      shieldOutline,
      personOutline,
      restaurantOutline,
    });
  }

  ngOnInit(): void {
    const role = this.cafeService.getProfile()?.role;
    if (role !== 'admin' && role !== 'moderator') {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }
    this.sub = this.cafeService.orders$.subscribe((orders) => {
      this.orders = orders;
    });
    this.refreshCounts();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private refreshCounts(): void {
    this.reviewsCount = this.cafeService.getReviews().length;
    this.openFlagsCount = this.cafeService.getOpenFlags().length;
    this.usersCount = this.cafeService.getUsers().length;
  }

  get firstName(): string {
    return this.cafeService.getProfile()?.name?.split(' ')[0] ?? 'Admin';
  }

  get activeCount(): number {
    return this.orders.filter((o) => o.status !== 'completed').length;
  }

  get revenue(): number {
    return this.orders.reduce((sum, o) => sum + o.total, 0);
  }

  get recentOrders(): Order[] {
    return [...this.orders]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 8);
  }

  money(n: number): string {
    return this.cafeService.formatPrice(n);
  }

  onStatusChange(orderId: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value as OrderStatus;
    this.cafeService.updateOrderStatus(orderId, value);
  }

  logout(): void {
    this.cafeService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
