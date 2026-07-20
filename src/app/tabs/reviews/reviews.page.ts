import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  star,
  starOutline,
  flagOutline,
  checkmarkCircle,
  sparklesOutline,
  closeOutline,
  checkmarkDoneOutline,
  cafeOutline,
  createOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Review, MenuItem, CafeService } from 'src/app/services/cafe';
import { TableService } from 'src/app/services/table';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-reviews-tab',
  templateUrl: 'reviews.page.html',
  styleUrls: ['reviews.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonSpinner,
    CommonModule,
    FormsModule,
    BrandDustComponent,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReviewsTabPage {
  // Form state
  selectedDishId = '';
  rating: number = 5;
  comment: string = '';

  // Filter state
  filterDish: string = 'all';
  sortBy: 'newest' | 'highest' | 'lowest' = 'newest';

  // Data — sourced from CafeService (single source of truth)
  reviews: Review[] = [];
  menuItems: MenuItem[] = [];
  profile: { name: string } | null = null;
  isLoading = true;
  stars = [1, 2, 3, 4, 5];

  // Shared table state
  tableNumber: string | null = null;
  private tableSub = new Subscription();

  constructor(
    private cafeService: CafeService,
    private toastController: ToastController,
    private tableService: TableService,
  ) {
    addIcons({
      star,
      starOutline,
      flagOutline,
      checkmarkCircle,
      sparklesOutline,
      closeOutline,
      checkmarkDoneOutline,
      cafeOutline,
      createOutline,
    });
  }

  ngOnInit() {
    this.menuItems = this.cafeService.getMenu();
    this.selectedDishId = this.menuItems[0]?.id ?? '';
    this.loadData();
    this.tableSub.add(
      this.tableService.table$.subscribe((t) => {
        this.tableNumber = t !== null ? String(t) : null;
      }),
    );
  }

  ngOnDestroy() {
    this.tableSub.unsubscribe();
  }

  loadData() {
    this.isLoading = true;
    setTimeout(() => {
      this.reviews = this.cafeService.getReviews();
      this.profile = this.cafeService.getProfile();
      this.isLoading = false;
    }, 500);
  }

  // ---- Derived data -----------------------------------------------------
  get topRatedDishes(): { id: string; avg: number; count: number }[] {
    const map = new Map<string, { total: number; count: number }>();
    for (const r of this.reviews) {
      const c = map.get(r.dishId) ?? { total: 0, count: 0 };
      c.total += r.rating;
      c.count += 1;
      map.set(r.dishId, c);
    }
    return [...map.entries()]
      .map(([id, s]) => ({ id, avg: s.total / s.count, count: s.count }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count)
      .slice(0, 5);
  }

  get filteredReviews(): Review[] {
    let list =
      this.filterDish === 'all'
        ? [...this.reviews]
        : this.reviews.filter((r) => r.dishId === this.filterDish);

    if (this.sortBy === 'newest') {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (this.sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
    } else {
      list.sort((a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt));
    }

    return list.slice(0, 30);
  }

  // ---- Helpers -----------------------------------------------------------
  dish(id: string): MenuItem | undefined {
    return this.menuItems.find((m) => m.id === id);
  }

  dishName(id: string): string {
    const d = this.dish(id);
    return d ? `${d.emoji} ${d.name}` : id;
  }

  dishEmoji(id: string): string {
    return this.dish(id)?.emoji || '🍽️';
  }

  trackByTop(_: number, item: { id: string }): string {
    return item.id;
  }

  trackByReview(_: number, r: Review): string {
    return r.id;
  }

  isFilled(n: number, value: number): boolean {
    return n <= value;
  }

  round(value: number): number {
    return Math.round(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  isOwnReview(author: string): boolean {
    return this.profile?.name === author;
  }

  // Reviewer initials for the editorial avatar (e.g. "Rose M." -> "RM").
  initials(author: string): string {
    const parts = (author || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '·';
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  // ---- Actions -----------------------------------------------------------
  async submitReview() {
    if (!this.comment.trim()) return;

    this.cafeService.addReview({
      dishId: this.selectedDishId,
      rating: this.rating,
      comment: this.comment.trim(),
      author: this.profile?.name || 'Guest',
    });

    this.reviews = this.cafeService.getReviews();
    const name = this.dish(this.selectedDishId)?.name ?? 'dish';

    this.comment = '';
    this.rating = 5;
    const firstDish = this.menuItems.length > 0 ? this.menuItems[0] : { id: '' };
    this.selectedDishId = firstDish.id;

    const toast = await this.toastController.create({
      message: `Thanks — your note on ${name} is live`,
      duration: 1800,
      position: 'bottom',
      icon: 'checkmark-done-outline',
      cssClass: 'rv-toast',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await toast.present();
  }

  async reportReview(reviewId: string) {
    this.cafeService.addFlag({
      targetType: 'review',
      targetId: reviewId,
      reason: 'Reported by user',
      reporter: this.profile?.name || 'Guest',
    });

    const toast = await this.toastController.create({
      message: 'Reported — thank you for keeping the table honest',
      duration: 1900,
      position: 'bottom',
      icon: 'flag-outline',
      cssClass: 'rv-toast--muted',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await toast.present();
  }
}
