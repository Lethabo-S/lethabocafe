import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';
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
  cafeOutline,
  peopleOutline,
  flagOutline,
  banOutline,
  checkmarkCircle,
  closeCircle,
  informationCircle,
  warning,
  mailOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-copyright',
  templateUrl: 'copyright.page.html',
  styleUrls: ['copyright.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon, RouterLink, BloomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CopyrightPage {
  constructor() {
    addIcons({
      cafeOutline,
      peopleOutline,
      flagOutline,
      banOutline,
      checkmarkCircle,
      closeCircle,
      informationCircle,
      warning,
      mailOutline,
    });
  }
}
