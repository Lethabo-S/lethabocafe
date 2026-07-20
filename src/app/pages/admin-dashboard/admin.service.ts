import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'staff' | 'customer';
  createdAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: string[];
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    favoriteCategory?: string;
    dietaryRestrictions?: string[];
  };
  createdAt?: string;
}

export interface AdminItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  emoji?: string;
  featured?: boolean;
  rating?: number;
  stock?: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = '/api/admin';

  // In-memory data for demo (replace with real API calls)
  private _users: User[] = [
    { id: '1', name: 'Lethabo Suprise', email: 'lethabo@foreverrose.com', role: 'admin' },
    { id: '2', name: 'Rose', email: 'rose@foreverrose.com', role: 'moderator' },
    { id: '3', name: 'Sarah M.', email: 'sarah@example.com', role: 'customer' },
  ];

  private _permissions: Permission[] = [
    { id: '1', name: 'Manage Users', description: 'Create, edit, delete users', resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { id: '2', name: 'Manage Menu', description: 'Edit menu items', resource: 'items', actions: ['create', 'read', 'update', 'delete'] },
    { id: '3', name: 'View Reports', description: 'Access analytics', resource: 'reports', actions: ['read'] },
  ];

  private _customers: Customer[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+27 71 234 5678' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+27 82 345 6789' },
  ];

  private _items: AdminItem[] = [
    { id: '1', name: 'Breakfast Platter', description: 'Morning favorites', price: 45.00, category: 'morning', emoji: '🍳', featured: true },
    { id: '2', name: 'Braai Platter', description: 'Signature BBQ', price: 180.00, category: 'braai', emoji: '🔥', featured: true },
    { id: '3', name: 'Caesar Salad', description: 'Classic salad', price: 65.00, category: 'salad', emoji: '🥗' },
    { id: '4', name: 'Malva Pudding', description: 'Warm spiced sponge with custard', price: 55.00, category: 'dessert', emoji: '🍮' },
  ];

  constructor() {}

  // Users CRUD
  getUsers(): Observable<User[]> {
    return of([...this._users]).pipe(delay(300));
  }

  getUser(id: string): Observable<User | undefined> {
    return of(this._users.find(u => u.id === id)).pipe(delay(200));
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): Observable<User> {
    const newUser: User = {
      id: Date.now().toString(),
      ...user,
      createdAt: new Date().toISOString(),
    };
    this._users.push(newUser);
    return of(newUser).pipe(delay(500));
  }

  updateUser(id: string, updates: Partial<User>): Observable<User | null> {
    const idx = this._users.findIndex(u => u.id === id);
    if (idx === -1) return of(null).pipe(delay(300));
    this._users[idx] = { ...this._users[idx], ...updates };
    return of(this._users[idx]).pipe(delay(500));
  }

  deleteUser(id: string): Observable<boolean> {
    const idx = this._users.findIndex(u => u.id === id);
    if (idx === -1) return of(false).pipe(delay(300));
    this._users.splice(idx, 1);
    return of(true).pipe(delay(500));
  }

  // Permissions CRUD
  getPermissions(): Observable<Permission[]> {
    return of([...this._permissions]).pipe(delay(300));
  }

  getPermission(id: string): Observable<Permission | undefined> {
    return of(this._permissions.find(p => p.id === id)).pipe(delay(200));
  }

  createPermission(permission: Omit<Permission, 'id' | 'createdAt'>): Observable<Permission> {
    const newPerm: Permission = {
      id: Date.now().toString(),
      ...permission,
      createdAt: new Date().toISOString(),
    };
    this._permissions.push(newPerm);
    return of(newPerm).pipe(delay(500));
  }

  updatePermission(id: string, updates: Partial<Permission>): Observable<Permission | null> {
    const idx = this._permissions.findIndex(p => p.id === id);
    if (idx === -1) return of(null).pipe(delay(300));
    this._permissions[idx] = { ...this._permissions[idx], ...updates };
    return of(this._permissions[idx]).pipe(delay(500));
  }

  deletePermission(id: string): Observable<boolean> {
    const idx = this._permissions.findIndex(p => p.id === id);
    if (idx === -1) return of(false).pipe(delay(300));
    this._permissions.splice(idx, 1);
    return of(true).pipe(delay(500));
  }

  // Customers CRUD
  getCustomers(): Observable<Customer[]> {
    return of([...this._customers]).pipe(delay(300));
  }

  getCustomer(id: string): Observable<Customer | undefined> {
    return of(this._customers.find(c => c.id === id)).pipe(delay(200));
  }

  createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Observable<Customer> {
    const newCust: Customer = {
      id: Date.now().toString(),
      ...customer,
      createdAt: new Date().toISOString(),
    };
    this._customers.push(newCust);
    return of(newCust).pipe(delay(500));
  }

  updateCustomer(id: string, updates: Partial<Customer>): Observable<Customer | null> {
    const idx = this._customers.findIndex(c => c.id === id);
    if (idx === -1) return of(null).pipe(delay(300));
    this._customers[idx] = { ...this._customers[idx], ...updates };
    return of(this._customers[idx]).pipe(delay(500));
  }

  deleteCustomer(id: string): Observable<boolean> {
    const idx = this._customers.findIndex(c => c.id === id);
    if (idx === -1) return of(false).pipe(delay(300));
    this._customers.splice(idx, 1);
    return of(true).pipe(delay(500));
  }

  // Items CRUD
  getItems(): Observable<AdminItem[]> {
    return of([...this._items]).pipe(delay(300));
  }

  getItem(id: string): Observable<AdminItem | undefined> {
    return of(this._items.find(i => i.id === id)).pipe(delay(200));
  }

  createItem(item: Omit<AdminItem, 'id' | 'createdAt'>): Observable<AdminItem> {
    const newItem: AdminItem = {
      id: Date.now().toString(),
      ...item,
      createdAt: new Date().toISOString(),
    };
    this._items.push(newItem);
    return of(newItem).pipe(delay(500));
  }

  updateItem(id: string, updates: Partial<AdminItem>): Observable<AdminItem | null> {
    const idx = this._items.findIndex(i => i.id === id);
    if (idx === -1) return of(null).pipe(delay(300));
    this._items[idx] = { ...this._items[idx], ...updates };
    return of(this._items[idx]).pipe(delay(500));
  }

  deleteItem(id: string): Observable<boolean> {
    const idx = this._items.findIndex(i => i.id === id);
    if (idx === -1) return of(false).pipe(delay(300));
    this._items.splice(idx, 1);
    return of(true).pipe(delay(500));
  }
}