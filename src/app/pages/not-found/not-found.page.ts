import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { cafeOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-not-found',
  templateUrl: 'not-found.page.html',
  styleUrls: ['not-found.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotFoundPage {
  constructor() {
    addIcons({ cafeOutline, arrowForwardOutline });
  }
}
