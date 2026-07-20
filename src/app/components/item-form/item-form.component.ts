import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, trashOutline, chevronDownOutline } from 'ionicons/icons';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { AdminService } from 'src/app/pages/admin-dashboard/admin.service';

addIcons({ checkmarkDoneOutline, trashOutline, chevronDownOutline });

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemFormComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() id?: string;
  @Input() data?: any;

  form!: FormGroup;
  saving = false;
  isEdit = false;

  categories = [
    { value: 'morning', label: 'Morning' },
    { value: 'braai', label: 'Braai' },
    { value: 'sharing', label: 'Sharing' },
    { value: 'salad', label: 'Salad' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'drink', label: 'Drink' },
  ];

  constructor(private admin: AdminService, private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.isEdit = this.mode === 'edit' && !!this.id;
    this.buildForm();
    if (this.isEdit && this.id) {
      this.admin.getItem(this.id).subscribe((item) => {
        if (item) this.form.patchValue(item);
      });
    }
  }

  private buildForm(): void {
    this.form = new FormGroup({
      name: new FormControl(this.data?.name ?? '', [Validators.required]),
      description: new FormControl(this.data?.description ?? ''),
      price: new FormControl(this.data?.price ?? '', [Validators.required, Validators.min(0)]),
      category: new FormControl(this.data?.category ?? '', [Validators.required]),
      emoji: new FormControl(this.data?.emoji ?? ''),
      featured: new FormControl(!!this.data?.featured),
      stock: new FormControl(this.data?.stock ?? ''),
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving = true;
    const value = this.form.value;
    const obs = this.mode === 'create'
      ? this.admin.createItem(value)
      : this.admin.updateItem(this.id!, value);
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
    if (!confirm('Delete this item?')) return;
    this.admin.deleteItem(this.id!).subscribe(() => this.dismiss());
  }

  dismiss(result?: any): void {
    this.modalCtrl.dismiss(result ?? { saved: true });
  }
}
