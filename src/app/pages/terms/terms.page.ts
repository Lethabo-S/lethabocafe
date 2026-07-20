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
import { bagHandleOutline, personCircleOutline, shieldOutline } from 'ionicons/icons';

@Component({
  selector: 'app-terms',
  templateUrl: 'terms.page.html',
  styleUrls: ['terms.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TermsPage {
  constructor() {
    addIcons({ bagHandleOutline, personCircleOutline, shieldOutline });
  }
}
