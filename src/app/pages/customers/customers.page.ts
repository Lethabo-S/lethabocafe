import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { CrudListComponent } from 'src/app/components/crud-list/crud-list.component';

addIcons({ addOutline });

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, IonContent, IonHeader, IonToolbar,
     CommonModule, FormsModule, CrudListComponent],
     schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CustomersPage implements OnInit {
  @ViewChild(CrudListComponent) private list!: CrudListComponent;

  constructor() { }

  ngOnInit() {
  }

  addNew(): void {
    this.list?.openForm();
  }

}
