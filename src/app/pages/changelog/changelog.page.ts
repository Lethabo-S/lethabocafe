import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
} from '@ionic/angular/standalone';

interface ChangeEntry {
  version: string;
  date: string;
  tag: string;
  text: string;
}

@Component({
  selector: 'app-changelog',
  templateUrl: 'changelog.page.html',
  styleUrls: ['changelog.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChangelogPage {
  entries: ChangeEntry[] = [
    { version: '1.2.0', date: '10 July 2026', tag: 'New', text: 'Added the Scan tab and loyalty QR support.' },
    { version: '1.1.0', date: '22 June 2026', tag: 'Improved', text: 'Refreshed café theme across all screens.' },
    { version: '1.0.0', date: '1 June 2026', tag: 'Release', text: 'Initial launch of the Lethabo Café app.' },
  ];
}
