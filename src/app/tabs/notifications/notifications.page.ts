import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trashOutline,
  notificationsOffOutline,
  checkmarkDoneOutline,
  closeOutline,
  bagCheckOutline,
  chatbubbleEllipsesOutline,
  pricetagOutline,
  trophyOutline,
  handLeftOutline,
  informationCircleOutline,
  cardOutline,
  calendarOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  NotificationType,
} from 'src/app/services/notification';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

const ICONS: Record<NotificationType, string> = {
  'order-ready': 'bag-check-outline',
  'review-reply': 'chatbubble-ellipses-outline',
  promo: 'pricetag-outline',
  loyalty: 'trophy-outline',
  waiter: 'hand-left-outline',
  system: 'information-circle-outline',
  payment: 'card-outline',
  reservation: 'calendar-outline',
};

@Component({
  selector: 'app-notifications',
  templateUrl: 'notifications.page.html',
  styleUrls: ['notifications.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    CommonModule,
    BrandDustComponent,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationsPage {
  constructor(
    public ns: NotificationService,
    private toastController: ToastController,
  ) {
    addIcons({
      trashOutline,
      notificationsOffOutline,
      checkmarkDoneOutline,
      closeOutline,
      bagCheckOutline,
      chatbubbleEllipsesOutline,
      pricetagOutline,
      trophyOutline,
      handLeftOutline,
      informationCircleOutline,
      cardOutline,
      calendarOutline,
    });
  }

  iconFor(type: NotificationType): string {
    return ICONS[type];
  }

  markRead(id: string): void {
    this.ns.markRead(id);
  }

  async markAllRead(): Promise<void> {
    if (this.ns.unreadCount() === 0) return;
    const count = this.ns.unreadCount();
    this.ns.markAllRead();
    await this.presentToast(`Marked ${count} note${count > 1 ? 's' : ''} as read`);
  }

  async deleteOne(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    const item = this.ns.items().find((n) => n.id === id);
    this.ns.remove(id);
    await this.presentToast(
      item ? `Removed “${item.title}”` : 'Notification removed',
    );
  }

  async clearAll(): Promise<void> {
    if (this.ns.items().length === 0) return;
    const count = this.ns.items().length;
    this.ns.clearAll();
    await this.presentToast(`Cleared ${count} notification${count > 1 ? 's' : ''}`);
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1900,
      position: 'bottom',
      icon: 'checkmark-done-outline',
      cssClass: 'nt-toast',
    });
    await toast.present();
  }
}
