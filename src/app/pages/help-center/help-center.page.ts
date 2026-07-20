import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  restaurantOutline,
  keyOutline,
  mailOutline,
  qrCodeOutline,
  chevronDown,
} from 'ionicons/icons';

@Component({
  selector: 'app-help-center',
  templateUrl: 'help-center.page.html',
  styleUrls: ['help-center.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HelpCenterPage {
  constructor() {
    addIcons({ restaurantOutline, keyOutline, mailOutline, qrCodeOutline, chevronDown });
  }
}
