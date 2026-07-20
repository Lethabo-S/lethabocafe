import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CafeService } from '../services/cafe';

export const authGuard: CanActivateFn = (route, state) => {
  const cafeService = inject(CafeService);
  const router = inject(Router);

  const profile = cafeService.getProfile();
  if (!profile) {
    router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const cafeService = inject(CafeService);
  const router = inject(Router);

  const profile = cafeService.getProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    router.navigateByUrl('/tabs/menu', { replaceUrl: true });
    return false;
  }
  return true;
};
