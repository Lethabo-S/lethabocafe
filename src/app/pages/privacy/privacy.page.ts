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
import { documentTextOutline, sparklesOutline, mailOutline } from 'ionicons/icons';

@Component({
  selector: 'app-privacy',
  templateUrl: 'privacy.page.html',
  styleUrls: ['privacy.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrivacyPage {
  constructor() {
    addIcons({ documentTextOutline, sparklesOutline, mailOutline });
  }
}
