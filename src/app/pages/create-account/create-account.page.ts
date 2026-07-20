import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cafeOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { CafeService } from 'src/app/services/cafe';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-create-account',
  templateUrl: 'create-account.page.html',
  styleUrls: ['create-account.page.scss'],
  imports: [IonContent, IonIcon, IonInput, FormsModule, CommonModule, RouterLink, BrandDustComponent, BloomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreateAccountPage {
  name = '';
  email = '';
  password = '';
  showPassword = false;
  creating = false;

  nameError = false;
  emailError = false;
  passwordError = false;

  constructor(
    public cafeService: CafeService,
    private toastController: ToastController,
    private router: Router,
  ) {
    addIcons({
      cafeOutline,
      personOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowForwardOutline,
      chevronBackOutline,
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private validEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async register(): Promise<void> {
    if (this.creating) return;

    this.nameError = !this.name.trim();
    this.emailError = !this.validEmail(this.email);
    this.passwordError = this.password.trim().length < 6;
    if (this.nameError || this.emailError || this.passwordError) return;

    this.creating = true;
    const result = this.cafeService.register(this.name, this.email, this.password);
    this.creating = false;

    if (!result.ok) {
      this.emailError = true;
      await this.presentToast(result.error ?? 'Could not create account', 'muted');
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    await this.presentToast('Account created — welcome!');
    setTimeout(() => this.router.navigateByUrl('/tabs/me', { replaceUrl: true }), 700);
  }

  private async presentToast(message: string, variant: 'default' | 'muted' = 'default') {
    const toast = await this.toastController.create({
      message,
      duration: 1900,
      position: 'bottom',
      cssClass: variant === 'muted' ? 'carte-toast rv-toast--muted' : 'carte-toast',
    });
    await toast.present();
  }
}
