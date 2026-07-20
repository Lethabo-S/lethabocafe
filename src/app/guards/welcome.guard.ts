import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const SEEN_KEY = 'cafe-welcome-seen';

export const welcomeGuard: CanActivateFn = () => {
  const router = inject(Router);

  let seen = false;
  try {
    seen = localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    seen = false;
  }

  if (seen) {
    router.navigateByUrl('/tabs/menu', { replaceUrl: true });
    return false;
  }
  return true;
};
