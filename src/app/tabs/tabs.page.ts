import { Component } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { TabBarComponent } from '../components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonRouterOutlet, TabBarComponent],
})
export class TabsPage {}
