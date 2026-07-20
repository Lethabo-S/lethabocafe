import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { bagAddOutline, flameOutline, leafOutline, cafeOutline, star } from 'ionicons/icons';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-details',
  templateUrl: 'details.page.html',
  styleUrls: ['details.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonIcon,
    CommonModule,
    RouterLink,
    BrandDustComponent,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DetailsPage {
  dish: {
    name: string;
    emoji: string;
    price: number;
    category: string;
    rating: number;
    desc: string;
    tag?: string;
  } = {
    name: 'Cappuccino',
    emoji: '☕',
    price: 32,
    category: 'Hot drinks',
    rating: 4.8,
    desc: 'A balanced espresso with steamed milk and a soft layer of foam. Made with house-roasted beans and your choice of dairy or plant milk.',
  };

  nutrition = [
    { label: 'Energy', value: '120 kcal' },
    { label: 'Protein', value: '6 g' },
    { label: 'Caffeine', value: '~120 mg' },
  ];

  constructor() {
    addIcons({ bagAddOutline, flameOutline, leafOutline, cafeOutline, star });
  }

  /** Small descriptors rendered as the scrolling notes ribbon. */
  get notes(): string[] {
    const out: string[] = [];
    if (this.dish.category) {
      out.push(this.dish.category.charAt(0).toUpperCase() + this.dish.category.slice(1));
    }
    if (this.dish.tag) out.push(this.dish.tag);
    if (this.dish.rating != null) out.push(`★ ${this.dish.rating.toFixed(1)}`);
    out.push(`R${this.dish.price.toFixed(0)}`);
    return out;
  }

  formatPrice(price: number): string {
    return `R ${price.toFixed(2)}`;
  }
}
