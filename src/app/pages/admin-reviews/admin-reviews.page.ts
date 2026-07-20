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
import {
  eyeOffOutline,
  eyeOutline,
  trashOutline,
  checkmarkDoneOutline,
} from 'ionicons/icons';
import { CafeService, Review } from 'src/app/services/cafe';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: 'admin-reviews.page.html',
  styleUrls: ['admin-reviews.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon, CommonModule, BloomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminReviewsPage {
  reviews: Review[] = [];

  constructor(
    public cafeService: CafeService,
  ) {
    addIcons({ eyeOffOutline, eyeOutline, trashOutline, checkmarkDoneOutline });
    this.reviews = this.cafeService.getReviews();
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

  toggleHidden(review: Review): void {
    this.cafeService.toggleReviewHidden(review.id);
    this.reviews = this.cafeService.getReviews();
  }

  remove(review: Review): void {
    this.cafeService.deleteReview(review.id);
    this.reviews = this.cafeService.getReviews();
  }
}
