import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';
import {
  createOutline,
  receiptOutline,
  heartOutline,
  settingsOutline,
  helpCircleOutline,
  peopleOutline,
  lockClosedOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  logInOutline,
  personAddOutline,
  chevronForward,
  ribbonOutline,
  cafeOutline,
  starOutline,
  ticketOutline,
} from 'ionicons/icons';
import { CafeService } from '../../services/cafe';

interface AccountLink {
  label: string;
  icon: string;
  url: string;
  note?: string;
}

interface AccountGroup {
  title: string;
  links: AccountLink[];
}

@Component({
  selector: 'app-me',
  templateUrl: 'me.page.html',
  styleUrls: ['me.page.scss'],
  imports: [IonHeader, IonToolbar, IonContent, IonIcon, CommonModule, RouterLink, BrandDustComponent, BloomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MePage {
  /** Loyalty state (mock, matches the café's Rosé Rewards programme). */
  readonly points = 1280;
  readonly nextTierAt = 1500;

  readonly groups: AccountGroup[] = [
    {
      title: 'Account',
      links: [
        { label: 'Offers & Promos', icon: 'ticket-outline', url: '/tabs/offers' },
        { label: 'My Orders', icon: 'receipt-outline', url: '/tabs/orders' },
        { label: 'Edit profile', icon: 'create-outline', url: '/profile' },
        { label: 'Favourites', icon: 'heart-outline', url: '/favorites' },
        { label: 'Settings', icon: 'settings-outline', url: '/settings' },
      ],
    },
    {
      title: 'Support & legal',
      links: [
        { label: 'Help centre', icon: 'help-circle-outline', url: '/help-center' },
        { label: 'Community', icon: 'people-outline', url: '/community' },
        { label: 'Privacy policy', icon: 'lock-closed-outline', url: '/privacy' },
        { label: 'Terms of service', icon: 'document-text-outline', url: '/terms' },
      ],
    },
  ];

  constructor(
    public cafeService: CafeService,
    private router: Router,
  ) {
    addIcons({
      createOutline,
      receiptOutline,
      heartOutline,
      settingsOutline,
      helpCircleOutline,
      peopleOutline,
      lockClosedOutline,
      documentTextOutline,
      shieldCheckmarkOutline,
      logOutOutline,
      chevronForward,
      ribbonOutline,
      cafeOutline,
      starOutline,
      ticketOutline,
      logInOutline,
      personAddOutline,
    });
  }

  /** Two-letter monogram from the member's name. */
  getInitials(name?: string | null): string {
    if (!name) return '☕';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || first.toUpperCase();
  }

  roleLabel(role?: string): string {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Member';
    }
  }

  /** Progress toward the next loyalty tier, 0–100. */
  get tierProgress(): number {
    return Math.min(100, Math.round((this.points / this.nextTierAt) * 100));
  }

  get pointsToNextTier(): number {
    return Math.max(0, this.nextTierAt - this.points);
  }

  logout(): void {
    this.cafeService.logout();
    this.router.navigate(['/login']);
  }
}
