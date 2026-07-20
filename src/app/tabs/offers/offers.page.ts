import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  restaurantOutline,
  iceCreamOutline,
  cafeOutline,
  bicycleOutline,
  copyOutline,
  ticketOutline,
  bookmarkOutline,
  bookmark,
  checkmarkDoneOutline,
  closeOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CouponService,
  Coupon,
  CouponCategory,
} from 'src/app/services/coupon';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

const ICONS: Record<CouponCategory, string> = {
  order: 'restaurant-outline',
  dessert: 'ice-cream-outline',
  coffee: 'cafe-outline',
  delivery: 'bicycle-outline',
};

type Filter = 'all' | 'active' | 'expiring' | 'saved';

@Component({
  selector: 'app-offers',
  templateUrl: 'offers.page.html',
  styleUrls: ['offers.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    CommonModule,
    FormsModule,
    BrandDustComponent,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OffersPage {
  filter: Filter = 'all';

  constructor(
    public cs: CouponService,
    private toastController: ToastController,
    private router: Router,
  ) {
    addIcons({
      restaurantOutline,
      iceCreamOutline,
      cafeOutline,
      bicycleOutline,
      copyOutline,
      ticketOutline,
      bookmarkOutline,
      bookmark,
      checkmarkDoneOutline,
      closeOutline,
    });
  }

  iconFor(category: CouponCategory): string {
    return ICONS[category];
  }

  get featured(): Coupon | undefined {
    return this.cs.coupons().find((c) => c.featured && !this.cs.isExpired(c));
  }

  /** Loyalty stamps (1–6) toward a free coffee. Seeds at 3 and grows as
   *  the member saves offers — a living meter for the membership card. */
  get stamps(): number {
    return Math.min(6, 3 + this.cs.savedIds().size);
  }

  get stampArray(): number[] {
    return [1, 2, 3, 4, 5, 6];
  }

  get visibleCoupons(): Coupon[] {
    const featuredId = this.featured?.id;
    const list = this.cs.coupons().filter((c) => c.id !== featuredId);
    switch (this.filter) {
      case 'active':
        return list.filter((c) => !this.cs.isExpired(c));
      case 'expiring':
        return list.filter(
          (c) => !this.cs.isExpired(c) && this.cs.daysLeft(c) <= 3,
        );
      case 'saved':
        return list.filter((c) => this.cs.isSaved(c.id));
      default:
        return list;
    }
  }

  get counts(): Record<Filter, number> {
    const list = this.cs.coupons();
    return {
      all: list.length,
      active: list.filter((c) => !this.cs.isExpired(c)).length,
      expiring: list.filter((c) => !this.cs.isExpired(c) && this.cs.daysLeft(c) <= 3).length,
      saved: this.cs.savedIds().size,
    };
  }

  expiryLabel(c: Coupon): string {
    if (this.cs.isExpired(c)) return 'Expired';
    const d = this.cs.daysLeft(c);
    if (d === 0) return 'Ends today';
    if (d === 1) return 'Ends tomorrow';
    return `Ends in ${d} days`;
  }

  /** Short descriptor of the saving, e.g. "20% OFF" or "R50 OFF". */
  badgeLabel(c: Coupon): string {
    if (c.kind === 'percent') return `${c.value}% OFF`;
    if (c.kind === 'fixed') return `R${c.value} OFF`;
    return 'FREE GIFT';
  }

  async copyCode(code: string, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard may be blocked in some contexts — still confirm visually */
    }
    await this.presentToast(`Copied “${code}”`);
  }

  async useOffer(c: Coupon): Promise<void> {
    if (this.cs.isExpired(c)) {
      await this.presentToast('That offer has expired');
      return;
    }
    this.cs.apply(c.code);
    await this.presentToast(`“${c.code}” ready at checkout`);
    this.router.navigateByUrl('/tabs/cart');
  }

  toggleSave(c: Coupon, event: Event): void {
    event.stopPropagation();
    this.cs.toggleSave(c.id);
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1900,
      position: 'bottom',
      icon: 'checkmark-done-outline',
      cssClass: 'of-toast',
    });
    await toast.present();
  }
}
