// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ==========================================
  // Mock Data
  // ==========================================

  private mockUser: User | null = {
    uid: 'mock_uid_123',
    email: 'lethabo@example.com',
    displayName: 'Lethabo',
    photoURL: 'https://i.pravatar.cc/150?u=lethabo'
  };

  // ==========================================
  // State
  // ==========================================

  private userSubject = new BehaviorSubject<User | null>(this.mockUser);
  user$ = this.userSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(true);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // ==========================================
  // Email/Password Authentication
  // ==========================================

  async register(email: string, password: string, name: string): Promise<User> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          uid: 'mock_uid_' + Date.now(),
          email,
          displayName: name,
        };
        this.userSubject.next(newUser);
        this.isAuthenticatedSubject.next(true);
        resolve(newUser);
      }, 500);
    });
  }

  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          uid: 'mock_uid_123',
          email,
          displayName: 'Lethabo',
        };
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        resolve(user);
      }, 500);
    });
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.userSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        resolve();
      }, 300);
    });
  }

  // ==========================================
  // Google Authentication (Mock)
  // ==========================================

  async loginWithGoogle(): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          uid: 'mock_google_uid_456',
          email: 'google.user@example.com',
          displayName: 'Google User',
          photoURL: 'https://i.pravatar.cc/150?u=google'
        };
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        resolve(user);
      }, 500);
    });
  }

  // ==========================================
  // Mock Helper Methods
  // ==========================================

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  // ==========================================
  // Set mock user (for testing)
  // ==========================================

  setMockUser(user: User | null) {
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(user !== null);
  }

  // ==========================================
  // Simulate Firebase token (for guards)
  // ==========================================

  async getIdTokenResult(): Promise<{ claims: { admin?: boolean; staff?: boolean } }> {
    return {
      claims: {
        admin: false,
        staff: false
      }
    };
  }
}