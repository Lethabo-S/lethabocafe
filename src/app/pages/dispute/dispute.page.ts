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
import { chatbubbleEllipsesOutline, searchOutline, checkmarkDoneOutline, helpBuoyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dispute',
  templateUrl: 'dispute.page.html',
  styleUrls: ['dispute.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon, RouterLink, BloomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DisputePage {
  constructor() {
    addIcons({ chatbubbleEllipsesOutline, searchOutline, checkmarkDoneOutline, helpBuoyOutline });
  }
}
