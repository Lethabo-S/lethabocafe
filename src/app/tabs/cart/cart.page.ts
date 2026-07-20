import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bagCheckOutline,
  bagOutline,
  removeOutline,
  addOutline,
  trashOutline,
  restaurantOutline,
  cardOutline,
  cashOutline,
  qrCodeOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuItem, CartItem, CafeService, PaymentMethod } from 'src/app/services/cafe';
import { TableService } from 'src/app/services/table';
import { CouponService } from 'src/app/services/coupon';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

interface CartViewItem extends MenuItem {
  qty: number;
}

@Component({
  selector: 'app-cart-tab',
  templateUrl: 'cart.page.html',
  styleUrls: ['cart.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonButton,
    CommonModule,
    RouterLink,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CartTabPage {
  cartItems: CartViewItem[] = [];
  cartTotal = 0;
  isPlacing = false;
  tableNumber: string | null = null;

  readonly paymentOptions: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'card', label: 'Card', icon: 'card-outline' },
    { id: 'cash', label: 'Cash', icon: 'cash-outline' },
    { id: 'qr', label: 'QR / SnapScan', icon: 'qr-code-outline' },
    { id: 'eft', label: 'EFT', icon: 'swap-horizontal-outline' },
  ];
  selectedPayment: PaymentMethod = 'card';

  private subs = new Subscription();

  constructor(
    private cafeService: CafeService,
    private toastController: ToastController,
    private router: Router,
    private tableService: TableService,
    public couponService: CouponService,
  ) {
    addIcons({
      bagCheckOutline,
      bagOutline,
      removeOutline,
      addOutline,
      trashOutline,
      restaurantOutline,
      cardOutline,
      cashOutline,
      qrCodeOutline,
      swapHorizontalOutline,
    });
  }

  ngOnInit() {
    // Pull the cart and keep total updated
    this.subs.add(
      this.cafeService.cart$.subscribe((items: CartItem[]) => {
        this.cartItems = items.map((ci) => ({
          ...ci.item,
          qty: ci.quantity,
        }));
        this.cartTotal = this.cafeService.getCartTotal();
      }),
    );

    // Shared table — synced with Scan / Menu / Reviews
    this.subs.add(
      this.tableService.table$.subscribe((t) => {
        this.tableNumber = t !== null ? String(t) : null;
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  updateQty(id: string, delta: number) {
    const item = this.cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = (item.qty || 1) + delta;
    if (newQty <= 0) {
      this.cafeService.removeFromCart(id);
    } else {
      this.cafeService.updateCartQuantity(id, newQty);
    }
  }

  removeItem(id: string) {
    this.cafeService.removeFromCart(id);
  }

  selectPayment(method: PaymentMethod): void {
    this.selectedPayment = method;
  }

  /** Saving from the active coupon for the current cart total (0 if N/A). */
  get couponDiscount(): number {
    const c = this.couponService.activeCoupon();
    return c ? this.couponService.discountFor(c, this.cartTotal) : 0;
  }

  /** What the customer actually pays after any active coupon. */
  get effectiveTotal(): number {
    return Math.max(0, this.cartTotal - this.couponDiscount);
  }

  getEarnedPoints(): number {
    return Math.floor(this.effectiveTotal / 10);
  }

  removeCoupon(): void {
    this.couponService.clearActive();
  }

  async checkout() {
    if (this.isPlacing) return;

    if (this.cartItems.length === 0) {
      await this.presentToast('Your cart is empty');
      return;
    }

    this.isPlacing = true;
    try {
      const points = this.getEarnedPoints();
      const order = this.cafeService.createOrder({
        customer: this.cafeService.getProfile()?.name ?? 'Guest',
        tableNumber: this.tableNumber ?? undefined,
        status: 'pending',
        paymentMethod: this.selectedPayment,
        total: this.effectiveTotal,
        items: this.cartItems.map((ci) => ({
          id: ci.id,
          name: ci.name,
          emoji: ci.emoji,
          qty: ci.qty,
          price: ci.price,
        })),
      });

      this.cafeService.clearCart();
      this.couponService.clearActive();
      const where = this.tableNumber ? `Table ${this.tableNumber}` : 'takeaway';
      await this.presentToast(`Order ${order.id} placed for ${where}! +${points} pts`);

      setTimeout(() => {
        this.router.navigateByUrl('/tabs/menu');
      }, 1500);
    } catch {
      await this.presentToast('Order failed — please retry');
    } finally {
      this.isPlacing = false;
    }
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'cart-toast',
    });
    await toast.present();
  }
}