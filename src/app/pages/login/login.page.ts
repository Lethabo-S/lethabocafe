import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonInput,
  IonCheckbox,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cafeOutline,
  logoGoogle,
  logoApple,
  eyeOutline,
  eyeOffOutline,
  lockClosedOutline,
  mailOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { CafeService } from 'src/app/services/cafe';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonInput,
    IonCheckbox,
    FormsModule,
    CommonModule,
    RouterLink,
    BrandDustComponent,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  remember = true;
  emailError = false;
  passwordError = false;
  signing = false;

  constructor(
    public cafeService: CafeService,
    private toastController: ToastController,
    private router: Router,
  ) {
    addIcons({
      cafeOutline,
      logoGoogle,
      logoApple,
      eyeOutline,
      eyeOffOutline,
      lockClosedOutline,
      mailOutline,
      arrowForwardOutline,
    });

    const remembered = localStorage.getItem('cafe-remember-email');
    if (remembered) {
      this.email = remembered;
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  socialSignIn(provider: 'google' | 'apple'): void {
    const mock = {
      google: { email: 'demo.user@gmail.com', name: 'Google Demo' },
      apple: { email: 'demo.user@icloud.com', name: 'Apple Demo' },
    };
    const { email, name } = mock[provider];

    // Log in if the demo user already exists, otherwise create them.
    let ok = this.cafeService.login(email, '');
    if (!ok) {
      ok = this.cafeService.register(name, email, 'social').ok;
    }
    if (!ok) {
      this.presentToast('Social sign-in failed', 'muted');
      return;
    }

    localStorage.setItem('cafe-remember-email', email);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    this.presentToast(`Signed in with ${provider === 'google' ? 'Google' : 'Apple'}`);
    this.goAfterLogin();
  }

  submit(): void {
    if (this.signing) return;
    this.emailError = !this.email.trim();
    this.passwordError = !this.password.trim();
    if (this.emailError || this.passwordError) return;

    this.signing = true;
    const ok = this.cafeService.login(this.email.trim(), this.password);
    this.signing = false;

    if (!ok) {
      this.passwordError = true;
      this.presentToast('Could not sign in — check your credentials', 'muted');
      return;
    }

    if (this.remember) {
      localStorage.setItem('cafe-remember-email', this.email.trim());
    } else {
      localStorage.removeItem('cafe-remember-email');
    }

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    this.presentToast('Welcome back');
    this.goAfterLogin();
  }

  private goAfterLogin(): void {
    const role = this.cafeService.getProfile()?.role;
    const target = role === 'admin' || role === 'moderator' ? '/admin-dashboard' : '/tabs/me';
    this.router.navigateByUrl(target, { replaceUrl: true });
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
