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
  selector: 'app-permission-form',
  templateUrl: './permission-form.component.html',
  styleUrls: ['./permission-form.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PermissionFormComponent implements OnInit {
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
      this.admin.getPermission(this.id).subscribe((perm) => {
        if (perm) {
          const actions = Array.isArray(perm.actions) ? perm.actions.join(', ') : perm.actions;
          this.form.patchValue({ ...perm, actions });
        }
      });
    }
  }

  private buildForm(): void {
    this.form = new FormGroup({
      name: new FormControl(this.data?.name ?? '', [Validators.required]),
      resource: new FormControl(this.data?.resource ?? '', [Validators.required]),
      actions: new FormControl(this.data?.actions ?? '', [Validators.required]),
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.saving = true;
    const raw = this.form.value;
    const value = {
      ...raw,
      actions: raw.actions
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
    };
    const obs = this.mode === 'create'
      ? this.admin.createPermission(value)
      : this.admin.updatePermission(this.id!, value);
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
    if (!confirm('Delete this permission?')) return;
    this.admin.deletePermission(this.id!).subscribe(() => this.dismiss());
  }

  dismiss(result?: any): void {
    this.modalCtrl.dismiss(result ?? { saved: true });
  }
}
