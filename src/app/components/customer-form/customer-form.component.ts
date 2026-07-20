import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, trashOutline } from 'ionicons/icons';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { AdminService } from 'src/app/pages/admin-dashboard/admin.service';

addIcons({ checkmarkDoneOutline, trashOutline });

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerFormComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() id?: string;
  @Input() data?: any;

  form!: FormGroup;
  saving = false;
  isEdit = false;

  constructor(private admin: AdminService, private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.isEdit = this.mode === 'edit' && !!this.id;
    this.buildForm();
    if (this.isEdit && this.id) {
      this.admin.getCustomer(this.id).subscribe((cust) => {
        if (cust) this.form.patchValue(cust);
      });
    }
  }

  private buildForm(): void {
    this.form = new FormGroup({
      name: new FormControl(this.data?.name ?? '', [Validators.required]),
      email: new FormControl(this.data?.email ?? '', [Validators.required, Validators.email]),
      phone: new FormControl(this.data?.phone ?? ''),
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving = true;
    const value = this.form.value;
    const obs = this.mode === 'create'
      ? this.admin.createCustomer(value)
      : this.admin.updateCustomer(this.id!, value);
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
    if (!confirm('Delete this customer?')) return;
    this.admin.deleteCustomer(this.id!).subscribe(() => this.dismiss());
  }

  dismiss(result?: any): void {
    this.modalCtrl.dismiss(result ?? { saved: true });
  }
}
