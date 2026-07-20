// src/app/core/services/table.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  // ==========================================
  // State
  // ==========================================

  private tableSubject = new BehaviorSubject<number | null>(null);
  table$ = this.tableSubject.asObservable();

  private branchSubject = new BehaviorSubject<string>('main');
  branch$ = this.branchSubject.asObservable();

  // ==========================================
  // Mock Data - Pre-set tables for testing
  // ==========================================

  private mockTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  private occupiedTables = [2, 5, 8]; // Mock occupied tables

  constructor() {
    // Restore from localStorage on init
    this.restoreFromStorage();
  }

  // ==========================================
  // Methods
  // ==========================================

  /**
   * Set the table number and branch
   */
  setTable(table: number, branch: string = 'main') {
    this.tableSubject.next(table);
    this.branchSubject.next(branch);
    
    // Persist to localStorage
    localStorage.setItem('tableNumber', String(table));
    localStorage.setItem('branch', branch);
  }

  /**
   * Get the current table number
   */
  getTable(): number | null {
    return this.tableSubject.value;
  }

  /**
   * Get the current branch
   */
  getBranch(): string {
    return this.branchSubject.value;
  }

  /**
   * Restore table from localStorage (called on app init)
   */
  restoreFromStorage() {
    const table = localStorage.getItem('tableNumber');
    const branch = localStorage.getItem('branch');
    
    if (table) {
      this.tableSubject.next(parseInt(table, 10));
      if (branch) this.branchSubject.next(branch);
    }
  }

  /**
   * Clear table data
   */
  clear() {
    this.tableSubject.next(null);
    this.branchSubject.next('main');
    localStorage.removeItem('tableNumber');
    localStorage.removeItem('branch');
  }

  /**
   * Check if table is set
   */
  hasTable(): boolean {
    return this.tableSubject.value !== null;
  }

  // ==========================================
  // Mock Table Management (for admin view)
  // ==========================================

  /**
   * Get all tables
   */
  getTables(): number[] {
    return this.mockTables;
  }

  /**
   * Get occupied tables
   */
  getOccupiedTables(): number[] {
    return this.occupiedTables;
  }

  /**
   * Check if table is occupied
   */
  isTableOccupied(table: number): boolean {
    return this.occupiedTables.includes(table);
  }

  /**
   * Mark table as occupied (admin)
   */
  occupyTable(table: number) {
    if (!this.occupiedTables.includes(table)) {
      this.occupiedTables.push(table);
    }
  }

  /**
   * Mark table as free (admin)
   */
  freeTable(table: number) {
    this.occupiedTables = this.occupiedTables.filter(t => t !== table);
  }
}