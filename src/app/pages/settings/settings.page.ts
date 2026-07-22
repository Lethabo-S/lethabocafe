import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  IonToggle,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  languageOutline,
  shieldCheckmarkOutline,
  cogOutline,
  informationCircleOutline,
  trashOutline,
  downloadOutline,
  warningOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AppSettings, CafeService } from 'src/app/services/cafe';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonIcon,
    IonToggle,
    CommonModule,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsPage implements OnInit, OnDestroy {
  settings!: AppSettings;
  private sub?: Subscription;

  readonly languages = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'af', label: '🇿🇦 Afrikaans' },
    { code: 'zu', label: '🇿🇦 isiZulu' },
    { code: 'xh', label: '🇿🇦 isiXhosa' },
  ];

  constructor(
    public cafeService: CafeService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
  ) {
    addIcons({
      notificationsOutline,
      languageOutline,
      shieldCheckmarkOutline,
      cogOutline,
      informationCircleOutline,
      trashOutline,
      downloadOutline,
      warningOutline,
    });
  }

  ngOnInit(): void {
    this.sub = this.cafeService.settings$.subscribe((s) => (this.settings = s));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  updateNotification(type: 'email' | 'push' | 'inApp', value: boolean): void {
    this.cafeService.updateSettings({
      notifications: { ...this.settings.notifications, [type]: value },
    });
    this.toast(`${this.label(type)} notifications ${value ? 'on' : 'off'}`);
  }

  updateCookie(type: 'analytics' | 'marketing', value: boolean): void {
    this.cafeService.updateSettings({
      cookies: { ...this.settings.cookies, [type]: value },
    });
    this.toast(`${this.label(type)} cookies ${value ? 'on' : 'off'}`);
  }

  updateLanguage(event: Event): void {
    const language = (event.target as HTMLSelectElement).value;
    this.cafeService.updateSettings({ language });
    const name = this.languages.find((l) => l.code === language)?.label ?? language;
    this.toast(`Language set to ${name.replace(/^[^\sA-Za-z]+\s*/, '')}`);
  }

  clearCache(): void {
    this.cafeService.resetSettings();
    this.toast('Cache cleared');
  }

  exportData(): void {
    const data = {
      profile: this.cafeService.getProfile(),
      orders: this.cafeService.getOrders(),
      settings: this.cafeService.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forever-rose-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('Data exported');
  }

  async deleteAccount(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete account',
      message: 'This permanently removes your account. This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.cafeService.deleteAccount();
            this.toast('Account deleted', 'muted');
            setTimeout(() => this.router.navigateByUrl('/login', { replaceUrl: true }), 600);
          },
        },
      ],
    });
    await alert.present();
  }

  private label(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private async toast(message: string, variant: 'default' | 'muted' = 'default') {
    const t = await this.toastController.create({
      message,
      duration: 1600,
      position: 'bottom',
      cssClass: variant === 'muted' ? 'carte-toast rv-toast--muted' : 'carte-toast',
    });
    await t.present();
  }
  
}
