import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';
import { welcomeGuard } from './guards/welcome.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'details',
    loadComponent: () => import('./pages/details/details.page').then((m) => m.DetailsPage),
  },
  {
    path: 'all-reviews',
    loadComponent: () =>
      import('./pages/all-reviews/all-reviews.page').then((m) => m.AllReviewsPage),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/favorites/favorites.page').then((m) => m.FavoritesPage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [authGuard],
  },
    {
    path: 'welcome',
    canActivate: [welcomeGuard],
    loadComponent: () => import('./pages/welcome/welcome.page').then((m) => m.WelcomePage),

  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'create-account',
    loadComponent: () =>
      import('./pages/create-account/create-account.page').then((m) => m.CreateAccountPage),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
    canActivate: [authGuard],
  },
  {
    path: 'help-center',
    loadComponent: () =>
      import('./pages/help-center/help-center.page').then((m) => m.HelpCenterPage),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.page').then((m) => m.PrivacyPage),
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms.page').then((m) => m.TermsPage),
  },
  {
    path: 'copyright',
    loadComponent: () =>
      import('./pages/copyright/copyright.page').then((m) => m.CopyrightPage),
  },
  {
    path: 'dispute',
    loadComponent: () => import('./pages/dispute/dispute.page').then((m) => m.DisputePage),
  },
  {
    path: 'changelog',
    loadComponent: () =>
      import('./pages/changelog/changelog.page').then((m) => m.ChangelogPage),
  },
  {
    path: 'community',
    loadComponent: () =>
      import('./pages/community/community.page').then((m) => m.CommunityPage),
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-reviews',
    loadComponent: () =>
      import('./pages/admin-reviews/admin-reviews.page').then((m) => m.AdminReviewsPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-flags',
    loadComponent: () =>
      import('./pages/admin-flags/admin-flags.page').then((m) => m.AdminFlagsPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-users',
    loadComponent: () =>
      import('./pages//users/users.page').then((m) => m.UsersPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-permissions',
    loadComponent: () =>
      import('./pages/permissions/permissions.page').then((m) => m.PermissionsPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-customers',
    loadComponent: () =>
      import('./pages/customers/customers.page').then((m) => m.CustomersPage),
    canActivate: [adminGuard],
  },
  {
    path: 'admin-items',
    loadComponent: () =>
      import('./pages/items/items.page').then((m) => m.ItemsPage),
    canActivate: [adminGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
  {
    path: 'customers',
    loadComponent: () => import('./pages/customers/customers.page').then( m => m.CustomersPage)
  },
  {
    path: 'items',
    loadComponent: () => import('./pages/items/items.page').then( m => m.ItemsPage)
  },
  {
    path: 'permissions',
    loadComponent: () => import('./pages/permissions/permissions.page').then( m => m.PermissionsPage)
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.page').then( m => m.UsersPage)
  },
];