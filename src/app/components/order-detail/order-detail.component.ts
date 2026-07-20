import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  receiptOutline,
  cashOutline,
  cardOutline,
  qrCodeOutline,
  swapHorizontalOutline,
  timeOutline,
  checkmarkDoneOutline,
  bagOutline,
  restaurantOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { CafeService, Order, OrderItem, OrderStatus, PaymentMethod } from 'src/app/services/cafe';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, BloomDirective],
})
export class OrderDetailComponent implements OnInit {
  @Input() order: Order | null = null;

  /** Local copy so the template always has a non-null value. */
  detail: Order = {
    id: '',
    customer: '',
    status: 'pending',
    total: 0,
    items: [],
    createdAt: new Date().toISOString(),
  };

  readonly paymentLabels: Record<PaymentMethod, string> = {
    card: 'Card',
    cash: 'Cash',
    qr: 'QR / SnapScan',
    eft: 'EFT',
  };

  readonly steps: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

  constructor(
    private modalController: ModalController,
    private cafeService: CafeService,
  ) {
    addIcons({
      closeOutline,
      receiptOutline,
      cashOutline,
      cardOutline,
      qrCodeOutline,
      swapHorizontalOutline,
      timeOutline,
      checkmarkDoneOutline,
      bagOutline,
      restaurantOutline,
    });
  }

  ngOnInit(): void {
    if (this.order) {
      this.detail = this.order;
    }
  }

  get statusIndex(): number {
    return this.steps.indexOf(this.detail.status);
  }

  stepState(step: OrderStatus): 'done' | 'current' | 'todo' {
    const i = this.steps.indexOf(step);
    if (i < this.statusIndex) return 'done';
    if (i === this.statusIndex) return 'current';
    return 'todo';
  }

  lineTotal(item: OrderItem): number {
    return item.price * item.qty;
  }

  payIcon(method?: PaymentMethod): string {
    switch (method) {
      case 'card': return 'card-outline';
      case 'cash': return 'cash-outline';
      case 'qr': return 'qr-code-outline';
      case 'eft': return 'swap-horizontal-outline';
      default: return 'cash-outline';
    }
  }

  formatMoney(n: number): string {
    return this.cafeService.formatPrice(n);
  }

  close(): void {
    this.modalController.dismiss();
  }
}
