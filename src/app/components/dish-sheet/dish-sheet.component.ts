import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, star, addOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'src/app/services/cafe';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

@Component({
  selector: 'app-dish-sheet',
  templateUrl: './dish-sheet.component.html',
  styleUrls: ['./dish-sheet.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, BloomDirective],
})
export class DishSheetComponent implements OnInit {
  @Input() item: MenuItem | null = null;

  dish: MenuItem = {
    id: '',
    name: '',
    desc: '',
    emoji: '',
    price: 0,
    category: 'morning',
  };

  constructor(private modalController: ModalController) {
    addIcons({ closeOutline, star, addOutline });
  }

  ngOnInit() {
    if (this.item) {
      this.dish = this.item;
    }
  }

  /** Small descriptors rendered as the scrolling notes ribbon. */
  get notes(): string[] {
    const out: string[] = [];
    if (this.dish.category) {
      out.push(this.dish.category.charAt(0).toUpperCase() + this.dish.category.slice(1));
    }
    if (this.dish.tag) out.push(this.dish.tag);
    if (this.dish.rating != null) out.push(`★ ${this.dish.rating.toFixed(1)}`);
    out.push(`R${this.dish.price.toFixed(0)}`);
    return out;
  }

  close() {
    this.modalController.dismiss();
  }

  addToCart() {
    if (this.dish) {
      this.modalController.dismiss({ action: 'add-to-cart', item: this.dish });
    }
  }
}
