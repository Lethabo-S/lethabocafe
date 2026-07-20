import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
} from '@ionic/angular/standalone';

interface Post {
  author: string;
  time: string;
  text: string;
}

@Component({
  selector: 'app-community',
  templateUrl: 'community.page.html',
  styleUrls: ['community.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommunityPage {
  posts: Post[] = [
    { author: 'Lethabo Café', time: '2h ago', text: 'New seasonal blend is in — come try it! ☕' },
    { author: 'Weekend Crew', time: 'Yesterday', text: 'Live acoustic set this Saturday from 11am.' },
    { author: 'Baristas', time: '3d ago', text: 'Latte-art throwdown results are up on the board!' },
  ];

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
