import { Component, Input, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  searchOutline,
  cubeOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { CafeService } from 'src/app/services/cafe';
import { AdminService } from 'src/app/pages/admin-dashboard/admin.service';
import { CrudFormComponent } from '../crud-form/crud-form.component';
import { ItemFormComponent } from '../item-form/item-form.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { PermissionFormComponent } from '../permission-form/permission-form.component';
import { CustomerFormComponent } from '../customer-form/customer-form.component';


export type EntityType = 'users' | 'permissions' | 'customers' | 'items';

addIcons({
  addOutline,
  searchOutline,
  cubeOutline,
  createOutline,
  trashOutline,
});
@Component({
  selector: 'app-crud-list',
  templateUrl: './crud-list.component.html',
  styleUrls: ['./crud-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CrudListComponent  implements OnInit {

 @Input() entity!: EntityType;
 
   private destroy$ = new Subject<void>();
 
   items: any[] = [];
   filtered: any[] = [];
   loading = true;
   search = '';
 
   entityConfig: {
     kicker: string;
     title: string;
     singular: string;
     subtitle: string;
     columns: { key: string; label: string; type?: string }[];
   } = { kicker: '', title: '', singular: '', subtitle: '', columns: [] };
 
   constructor(private admin: AdminService, private cafe: CafeService, private modalCtrl: ModalController) {}
 
   ngOnInit(): void {
     this.entityConfig = this.getConfig(this.entity);
     this.load();
   }
 
   ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }
 
   get colsTemplate(): string {
     const n = this.entityConfig.columns.length;
     return `repeat(${n}, minmax(110px, 1fr)) 84px`;
   }
 
   private getConfig(entity: EntityType) {
     switch (entity) {
       case 'users':
         return {
           kicker: 'The Team',
           title: 'Users',
           singular: 'user',
           subtitle: 'Manage staff and customer accounts',
           columns: [
             { key: 'name', label: 'Name' },
             { key: 'email', label: 'Email' },
             { key: 'role', label: 'Role', type: 'badge' },
           ],
         };
       case 'permissions':
         return {
           kicker: 'Access',
           title: 'Permissions',
           singular: 'permission',
           subtitle: 'Define role-based access',
           columns: [
             { key: 'name', label: 'Name' },
             { key: 'resource', label: 'Resource' },
             { key: 'actions', label: 'Actions' },
           ],
         };
       case 'customers':
         return {
           kicker: 'Guestbook',
           title: 'Customers',
           singular: 'customer',
           subtitle: 'Your loyal regulars',
           columns: [
             { key: 'name', label: 'Name' },
             { key: 'email', label: 'Email' },
             { key: 'phone', label: 'Phone' },
           ],
         };
       case 'items':
         return {
           kicker: 'The Carte',
           title: 'Menu Items',
           singular: 'item',
           subtitle: 'Dishes on the carte',
           columns: [
             { key: 'name', label: 'Name' },
             { key: 'category', label: 'Category' },
             { key: 'price', label: 'Price', type: 'money' },
             { key: 'featured', label: 'Featured', type: 'boolean' },
           ],
         };
       default:
         return { kicker: '', title: '', singular: '', subtitle: '', columns: [] };
     }
   }
 
   load(): void {
     this.loading = true;
     let obs: Observable<any>;
     switch (this.entity) {
       case 'users': obs = this.admin.getUsers(); break;
       case 'permissions': obs = this.admin.getPermissions(); break;
       case 'customers': obs = this.admin.getCustomers(); break;
       case 'items': obs = this.admin.getItems(); break;
     }
     obs.pipe(takeUntil(this.destroy$)).subscribe((data: any[]) => {
       this.items = data;
       this.applyFilter();
       this.loading = false;
     });
   }
 
   applyFilter(): void {
     const q = this.search.trim().toLowerCase();
     if (!q) {
       this.filtered = this.items;
       return;
     }
     this.filtered = this.items.filter((item) =>
       Object.values(item).some((v) => String(v).toLowerCase().includes(q))
     );
   }
 
   openForm(item?: any): void {
     const formMap: Record<EntityType, any> = {
       users: UserFormComponent,
       permissions: PermissionFormComponent,
       customers: CustomerFormComponent,
       items: ItemFormComponent,
     };
     this.modalCtrl
       .create({
         component: formMap[this.entity] ?? CrudFormComponent,
         componentProps: {
           mode: item ? 'edit' : 'create',
           id: item?.id,
           data: item ?? {},
         },
         breakpoints: [0, 0.5, 0.9],
         initialBreakpoint: 0.9,
         cssClass: 'crud-sheet',
       })
       .then((modal) => {
         modal.present();
         return modal.onDidDismiss();
       })
       .then(() => {
         this.load();
       });
   }
 
   create(payload: any): void {
     let obs: Observable<any>;
     switch (this.entity) {
       case 'users': obs = this.admin.createUser(payload); break;
       case 'permissions': obs = this.admin.createPermission(payload); break;
       case 'customers': obs = this.admin.createCustomer(payload); break;
       case 'items': obs = this.admin.createItem(payload); break;
     }
     obs.subscribe(() => this.load());
   }
 
   update(id: string, payload: any): void {
     let obs: Observable<any>;
     switch (this.entity) {
       case 'users': obs = this.admin.updateUser(id, payload); break;
       case 'permissions': obs = this.admin.updatePermission(id, payload); break;
       case 'customers': obs = this.admin.updateCustomer(id, payload); break;
       case 'items': obs = this.admin.updateItem(id, payload); break;
     }
     obs.subscribe(() => this.load());
   }
 
   remove(item: any): void {
     if (!confirm(`Delete ${this.entityConfig.singular} "${item.name ?? item.id}"?`)) return;
     let obs: Observable<any>;
     switch (this.entity) {
       case 'users': obs = this.admin.deleteUser(item.id); break;
       case 'permissions': obs = this.admin.deletePermission(item.id); break;
       case 'customers': obs = this.admin.deleteCustomer(item.id); break;
       case 'items': obs = this.admin.deleteItem(item.id); break;
     }
     obs.subscribe(() => this.load());
   }
 
   trackByFn = (_: number, item: any) => item.id;
 }
 