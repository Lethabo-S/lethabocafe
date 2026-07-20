
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, trashOutline, chevronDownOutline } from 'ionicons/icons';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CafeService } from 'src/app/services/cafe';
import { AdminService } from 'src/app/pages/admin-dashboard/admin.service';

addIcons({ checkmarkDoneOutline, trashOutline, chevronDownOutline });

export type EntityType = 'users' | 'permissions' | 'customers' | 'items';
@Component({
  selector: 'app-crud-form',
  templateUrl: './crud-form.component.html',
  styleUrls: ['./crud-form.component.scss'],
   imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
})

export class CrudFormComponent  implements OnInit {
 @Input() entity!: EntityType;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() id?: string; // used in edit mode
  @Input() data?: any; // prefilled data for edit

  private destroy$ = new Subject<void>();

  form!: FormGroup;
  saving = false;
  isEdit = false;

  entityConfig: {
    title: string;
    singular: string;
    fields: {
      name: string;
      label: string;
      type: string;
      placeholder?: string;
      inputType?: string;
      options?: { value: any; label: string }[];
      validators?: any[];
    }[];
  } = { title: '', singular: '', fields: [] };

  constructor(private admin: AdminService, private cafe: CafeService, private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.entityConfig = this.getConfig(this.entity);
    this.buildForm();

    if (this.mode === 'edit' && this.id) {
      this.isEdit = true;
      this.loadEntity();
    }
  }

  get fields() {
    return this.entityConfig.fields;
  }

  private getConfig(entity: EntityType) {
    switch (entity) {
      case 'users':
        return {
          title: 'User',
          singular: 'user',
          fields: [
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', validators: [Validators.required] },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com', validators: [Validators.required, Validators.email] },
            { name: 'role', label: 'Role', type: 'select', placeholder: 'Select role',
              options: [
                { value: 'admin', label: 'Admin' },
                { value: 'moderator', label: 'Moderator' },
                { value: 'staff', label: 'Staff' },
                { value: 'customer', label: 'Customer' }
              ], validators: [Validators.required] },
          ],
        };
      case 'permissions':
        return {
          title: 'Permission',
          singular: 'permission',
          fields: [
            { name: 'name', label: 'Permission Name', type: 'text', placeholder: 'Manage Menu Items', validators: [Validators.required] },
            { name: 'resource', label: 'Resource', type: 'text', placeholder: 'items', validators: [Validators.required] },
            { name: 'actions', label: 'Allowed Actions', type: 'textarea', placeholder: 'create,read,update,delete', validators: [Validators.required] },
          ],
        };
      case 'customers':
        return {
          title: 'Customer',
          singular: 'customer',
          fields: [
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith', validators: [Validators.required] },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com', validators: [Validators.required, Validators.email] },
            { name: 'phone', label: 'Phone', type: 'text', placeholder: '+27 82 123 4567' },
          ],
        };
      case 'items':
        return {
          title: 'Menu Item',
          singular: 'item',
          fields: [
            { name: 'name', label: 'Item Name', type: 'text', placeholder: 'Caesar Salad', validators: [Validators.required] },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Fresh greens with dressing' },
            { name: 'price', label: 'Price (ZAR)', type: 'number', placeholder: '65.00', validators: [Validators.required, Validators.min(0)] },
            { name: 'category', label: 'Category', type: 'select', placeholder: 'Select category',
              options: [
                { value: 'morning', label: 'Morning' },
                { value: 'braai', label: 'Braai' },
                { value: 'sharing', label: 'Sharing' },
                { value: 'salad', label: 'Salad' },
                { value: 'dessert', label: 'Dessert' },
                { value: 'drink', label: 'Drink' }
              ], validators: [Validators.required] },
            { name: 'emoji', label: 'Emoji (optional)', type: 'text', placeholder: '🥗' },
            { name: 'featured', label: 'Featured Item', type: 'toggle', placeholder: 'Show on the carte' },
            { name: 'stock', label: 'Stock Count', type: 'number', placeholder: 'Unlimited (leave blank)' },
          ],
        };
      default:
        return { title: '', singular: '', fields: [] };
    }
  }

  private buildForm(): void {
    const controls: any = {};
    this.entityConfig.fields.forEach((f) => {
      const validators = f.validators || [];
      const initial = f.type === 'toggle' ? !!this.data?.[f.name] : (this.data?.[f.name] ?? '');
      controls[f.name] = new FormControl(initial, validators);
    });
    this.form = new FormGroup(controls);
  }

  private loadEntity(): void {
    switch (this.entity) {
      case 'users':
        this.admin.getUser(this.id!).subscribe((user) => {
          if (user) this.form.patchValue(user);
        });
        break;
      case 'permissions':
        this.admin.getPermission(this.id!).subscribe((perm) => {
          if (perm) this.form.patchValue(perm);
        });
        break;
      case 'customers':
        this.admin.getCustomer(this.id!).subscribe((cust) => {
          if (cust) this.form.patchValue(cust);
        });
        break;
      case 'items':
        this.admin.getItem(this.id!).subscribe((item) => {
          if (item) this.form.patchValue(item);
        });
        break;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving = true;
    const value = this.form.value;

    let obs: Observable<any>;
    switch (this.entity) {
      case 'users':
        obs = this.mode === 'create'
          ? this.admin.createUser(value)
          : this.admin.updateUser(this.id!, value);
        break;
      case 'permissions':
        obs = this.mode === 'create'
          ? this.admin.createPermission(value)
          : this.admin.updatePermission(this.id!, value);
        break;
      case 'customers':
        obs = this.mode === 'create'
          ? this.admin.createCustomer(value)
          : this.admin.updateCustomer(this.id!, value);
        break;
      case 'items':
        obs = this.mode === 'create'
          ? this.admin.createItem(value)
          : this.admin.updateItem(this.id!, value);
        break;
    }

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.dismiss();
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  async onDelete(): Promise<void> {
    if (!confirm(`Delete this ${this.entityConfig.singular}?`)) return;
    let obs: Observable<any>;
    switch (this.entity) {
      case 'users':
        obs = this.admin.deleteUser(this.id!);
        break;
      case 'permissions':
        obs = this.admin.deletePermission(this.id!);
        break;
      case 'customers':
        obs = this.admin.deleteCustomer(this.id!);
        break;
      case 'items':
        obs = this.admin.deleteItem(this.id!);
        break;
    }
    obs.subscribe(() => this.dismiss());
  }

  dismiss(result?: any): void {
    this.modalCtrl.dismiss(result ?? { saved: true });
  }

  trackByFn = (_: number, item: any) => item.id;
}
