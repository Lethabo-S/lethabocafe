import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'menu',
        loadComponent: () =>
          import('../tabs/menu/menu.page').then((m) => m.MenuPage),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('../tabs/reviews/reviews.page').then((m) => m.ReviewsTabPage),
      },
      {
        path: 'scan',
        loadComponent: () =>
          import('../tabs/scan/scan.page').then((m) => m.ScanTabPage),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('../tabs/cart/cart.page').then((m) => m.CartTabPage),
      },
      {
        path: 'me',
        loadComponent: () =>
          import('../tabs/me/me.page').then((m) => m.MePage),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../tabs/notifications/notifications.page').then(
            (m) => m.NotificationsPage,
          ),
      },
      {
        path: 'offers',
        loadComponent: () =>
          import('../tabs/offers/offers.page').then((m) => m.OffersPage),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('../tabs/me/orders/orders.page').then((m) => m.MyOrdersPage),
      },
      {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/welcome',
    pathMatch: 'full',
  },
];
