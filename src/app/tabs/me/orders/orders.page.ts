import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CafeService, Order } from 'src/app/services/cafe';
import { OrderDetailComponent } from 'src/app/components/order-detail/order-detail.component';
import { addIcons } from 'ionicons';
import {
  receiptOutline,
  timeOutline,
  cafeOutline,
  diceOutline,
  checkmarkDone,
  textOutline,
  cashOutline,
  arrowBackOutline,
  eyeOutline,
} from 'ionicons/icons';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-my-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonIcon,
    CommonModule,
    RouterLink,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MyOrdersPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  private sub = new Subscription();

  constructor(
    private cafeService: CafeService,
    private router: Router,
    private modalController: ModalController,
  ) {
    addIcons({
      receiptOutline,
      timeOutline,
      cafeOutline,
      diceOutline,
      checkmarkDone,
      textOutline,
      cashOutline,
      arrowBackOutline,
      eyeOutline,
    });
  }

  ngOnInit(): void {
    const profile = this.cafeService.getProfile();
    if (!profile) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }
    this.sub.add(
      this.cafeService.orders$.subscribe((orders) => {
        this.orders = orders.filter(o => o.customer === profile.name);
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getStatusColor(status: Order['status']): string {
    const map: Record<Order['status'], string> = {
      pending: 'warning',
      preparing: 'primary',
      ready: 'success',
      completed: 'medium',
    };
    return map[status];
  }

  statusLabel(status: Order['status']): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'completed': return 'Served';
      default: return status;
    }
  }

  itemName(id: string): string {
    return this.cafeService.getMenuItem(id)?.name ?? id;
  }

  /** CSS modifier class for the status badge (matches orders.page.scss). */
  statusClass(status: Order['status']): string {
    return status;
  }

  formatMoney(total: number): string {
    return this.cafeService.formatPrice(total);
  }

  /** Open the order detail sheet. */
  async viewOrder(order: Order): Promise<void> {
    const modal = await this.modalController.create({
      component: OrderDetailComponent,
      componentProps: { order },
      initialBreakpoint: 0.92,
      breakpoints: [0, 0.5, 0.92],
      backdropDismiss: true,
    });
    await modal.present();
  }
}