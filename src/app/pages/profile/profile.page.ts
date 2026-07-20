import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonInput,
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  callOutline,
  saveOutline,
  ribbonOutline,
  cameraOutline,
} from 'ionicons/icons';
import { CafeService } from 'src/app/services/cafe';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonInput,
    IonIcon,
    FormsModule,
    CommonModule,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfilePage implements OnInit {
  name = '';
  email = '';
  phone = '';
  role = 'customer';
  joinedAt = '';
  loading = true;
  saving = false;

  constructor(
    public cafeService: CafeService,
    private toastController: ToastController,
    private router: Router,
  ) {
    addIcons({
      personOutline,
      mailOutline,
      callOutline,
      saveOutline,
      ribbonOutline,
      cameraOutline,
    });
  }

  ngOnInit(): void {
    const p = this.cafeService.getProfile();
    if (p) {
      this.name = p.name;
      this.email = p.email;
      this.phone = p.phone ?? '';
      this.role = p.role;
      this.joinedAt = p.joinedAt;
    }
    setTimeout(() => (this.loading = false), 500);
  }

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '☕';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  roleLabel(): string {
    switch (this.role) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Member';
    }
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  async save(): Promise<void> {
    if (this.saving) return;

    if (!this.name.trim()) {
      await this.presentToast('Please enter your name', 'muted');
      return;
    }

    this.saving = true;
    this.cafeService.updateProfile({
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
    });

    await this.presentToast('Profile saved');
    this.saving = false;
    setTimeout(() => this.router.navigateByUrl('/tabs/me'), 700);
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
