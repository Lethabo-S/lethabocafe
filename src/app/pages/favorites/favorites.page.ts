import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, heart, add, cafeOutline, bagAddOutline, trashOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { CafeService, MenuItem } from 'src/app/services/cafe';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-favorites',
  templateUrl: 'favorites.page.html',
  styleUrls: ['favorites.page.scss'],
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
export class FavoritesPage implements OnInit, OnDestroy {
  favoriteItems: MenuItem[] = [];
  private sub?: Subscription;

  constructor(
    public cafeService: CafeService,
    private toastController: ToastController,
  ) {
    addIcons({ heartOutline, heart, add, cafeOutline, bagAddOutline, trashOutline });
  }

  ngOnInit(): void {
    // React to favourite changes so removals update the list instantly.
    this.sub = this.cafeService.favorites$.subscribe(() => {
      this.favoriteItems = this.cafeService.getFavoriteItems();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  addToCart(item: MenuItem): void {
    this.cafeService.addToCart(item);
    this.presentToast(`${item.name} added to cart`);
  }

  removeFavorite(item: MenuItem): void {
    this.cafeService.toggleFavorite(item.id);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    this.presentToast(`${item.name} removed from favourites`, 'muted');
  }

  trackById(_: number, item: MenuItem): string {
    return item.id;
  }

  private async presentToast(message: string, variant: 'default' | 'muted' = 'default') {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      position: 'bottom',
      cssClass: variant === 'muted' ? 'carte-toast rv-toast--muted' : 'carte-toast',
    });
    await toast.present();
  }
}
