import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { CrudListComponent } from 'src/app/components/crud-list/crud-list.component';

addIcons({ addOutline });

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, IonContent, IonHeader, IonToolbar,
     CommonModule, FormsModule, CrudListComponent],
     schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsersPage implements OnInit {
  @ViewChild(CrudListComponent) private list!: CrudListComponent;

  constructor() { }

  ngOnInit() {
  }

  addNew(): void {
    this.list?.openForm();
  }

}
