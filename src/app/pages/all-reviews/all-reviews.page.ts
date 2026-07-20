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
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { CafeService, Review } from 'src/app/services/cafe';

@Component({
  selector: 'app-all-reviews',
  templateUrl: 'all-reviews.page.html',
  styleUrls: ['all-reviews.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AllReviewsPage {
  reviews: Review[] = [];
  stars = [1, 2, 3, 4, 5];

  constructor(private cafeService: CafeService) {
    addIcons({ star });
    this.reviews = this.cafeService.getVisibleReviews();
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  dishName(dishId: string): string | null {
    return this.cafeService.getMenuItem(dishId)?.name ?? null;
  }
}
