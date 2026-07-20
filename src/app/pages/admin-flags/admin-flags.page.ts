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
import { checkmarkCircleOutline, closeCircleOutline, flagOutline } from 'ionicons/icons';
import { CafeService, Flag } from 'src/app/services/cafe';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-admin-flags',
  templateUrl: 'admin-flags.page.html',
  styleUrls: ['admin-flags.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon, CommonModule, BloomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminFlagsPage {
  flags: Flag[] = [];

  constructor(public cafeService: CafeService) {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, flagOutline });
    this.flags = this.cafeService.getFlags();
  }

  resolve(flag: Flag): void {
    this.cafeService.resolveFlag(flag.id, 'resolved');
    this.flags = this.cafeService.getFlags();
  }

  dismiss(flag: Flag): void {
    this.cafeService.resolveFlag(flag.id, 'dismissed');
    this.flags = this.cafeService.getFlags();
  }
}
