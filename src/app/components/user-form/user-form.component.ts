import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, trashOutline } from 'ionicons/icons';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { AdminService } from 'src/app/pages/admin-dashboard/admin.service';

addIcons({ checkmarkDoneOutline, trashOutline });

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserFormComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() id?: string;
  @Input() data?: any;

  form!: FormGroup;
  saving = false;
  isEdit = false;

  roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'staff', label: 'Staff' },
    { value: 'customer', label: 'Customer' },
  ];

  constructor(
    private admin: AdminService, 
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder ) {}

  ngOnInit(): void {
    this.isEdit = this.mode === 'edit' && !!this.id;
    this.buildForm();
    if (this.isEdit && this.id) {
      this.admin.getUser(this.id).subscribe((user) => {
        if (user) this.form.patchValue(user);
      });
    }
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      // name: new FormControl(this.data?.name ?? '', [Validators.required]),
      // email: new FormControl(this.data?.email ?? '', [Validators.required, Validators.email]),
      // role: new FormControl(this.data?.role ?? '', [Validators.required]),
      name: [
      this.data?.name ?? '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z0-9 ]*$/), // allow letters, numbers, spaces
      ],
    ],
    email: [
      this.data?.email ?? '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), // enforce email format
      ],
    ],
    role: [
      this.data?.role ?? '',
      [
        Validators.required,
        Validators.pattern(/^(admin|moderator|staff|customer)$/), // enforce valid role
      ],
    ],

    });
  }

  getErrorMessage(controlName: string): string | null {
  const control = this.form.get(controlName);
  if (!control || control.valid || !control.touched) return null;

  const errors = control.errors;
  if (errors?.['required']) return `${controlName} is required.`;
  if (errors?.['email']) return 'Invalid email format.';
  if (errors?.['pattern']) {
    return controlName === 'role'
      ? 'Please select a valid role.'
      : `Invalid ${controlName} format.`;
  }
  if (errors?.['minlength']) {
    return `${controlName} must be at least ${errors['minlength'].requiredLength} characters.`;
  }
  return null;
}

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving = true;
    const value = this.form.value;
    const obs = this.mode === 'create'
      ? this.admin.createUser(value)
      : this.admin.updateUser(this.id!, value);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.dismiss();
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  async onDelete(): Promise<void> {
    if (!confirm('Delete this user?')) return;
    this.admin.deleteUser(this.id!).subscribe(() => this.dismiss());
  }

  dismiss(result?: any): void {
    this.modalCtrl.dismiss(result ?? { saved: true });
  }
}
