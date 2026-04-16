import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      return true;
    }
  }

  // Not an admin? Send them home!
  alert('⛔ Access Denied: This area is for Admins only.');
  router.navigate(['/']);
  return false;
};
