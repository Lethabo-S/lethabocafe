import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cafeOutline,
  mailOutline,
  chevronBackOutline,
  paperPlaneOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-reset-password',
  templateUrl: 'reset-password.page.html',
  styleUrls: ['reset-password.page.scss'],
  imports: [IonContent, IonIcon, IonInput, FormsModule, CommonModule, RouterLink, BrandDustComponent, BloomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ResetPasswordPage {
  email = '';
  emailError = false;
  sending = false;
  sent = false;

  constructor() {
    addIcons({
      cafeOutline,
      mailOutline,
      chevronBackOutline,
      paperPlaneOutline,
      checkmarkCircleOutline,
    });
  }

  private validEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  sendReset(): void {
    if (this.sending) return;
    this.emailError = !this.validEmail(this.email);
    if (this.emailError) return;

    this.sending = true;
    // Simulated request — a real app would call an auth endpoint here.
    setTimeout(() => {
      this.sending = false;
      this.sent = true;
    }, 900);
  }

  tryAgain(): void {
    this.sent = false;
  }
}
