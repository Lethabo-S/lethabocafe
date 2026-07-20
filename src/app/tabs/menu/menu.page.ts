import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  star,
  addOutline,
  heart,
  heartOutline,
  arrowForwardOutline,
  sparklesOutline,
  closeOutline,
  checkmarkDoneOutline,
  cafeOutline,
  flameOutline,
  giftOutline,
  bicycleOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { DishSheetComponent } from 'src/app/components/dish-sheet/dish-sheet.component';
import { MenuItem, CafeService } from 'src/app/services/cafe';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';
import { TableService } from 'src/app/services/table';
import { Category, CATEGORIES } from 'src/app/data/cafe-data';

type SortKey = 'popularity' | 'rating' | 'price-asc' | 'price-desc';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'popularity', label: 'Popularity' },
  { id: 'rating', label: 'Top rated' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

const CATEGORY_ORDER: Category[] = [
  'morning',
  'sharing',
  'salad',
  'braai',
  'side',
  'dessert',
  'drink',
];

interface Promo {
  eyebrow: string;
  title: string;
  body: string;
  code?: string;
  cta: string;
  link: string;
  tone: 'rose' | 'gold' | 'ink';
  icon: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.html',
  styleUrls: ['menu.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
    RouterLink,
    BrandDustComponent,
    BloomDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MenuPage {
  // State
  selectedCategory: Category | 'all' = 'all';
  searchQuery: string = '';
  sortKey: SortKey = 'popularity';
  featuredOnly: boolean = false;
  isLoading: boolean = true;

  // Data
  menuItems: MenuItem[] = [];
  featuredItems: MenuItem[] = [];
  categories = CATEGORIES;
  sortOptions = SORTS;

  // Greeting
  greeting: string = 'Welcome';
  memberName: string | null = null;

  // Promotions — auto-sliding editorial carousel
  promos: Promo[] = [
    {
      eyebrow: 'Rosé Rewards',
      title: 'A free coffee at 1 500 pts',
      body: "You're 220 pts from your next cup on the house. Sip your way there.",
      code: 'ROSE1500',
      cta: 'View rewards',
      link: '/tabs/offers',
      tone: 'rose',
      icon: 'cafe-outline',
    },
    {
      eyebrow: 'Weekend Braai',
      title: 'Feast over the coals',
      body: '20% off the Braai board — sirloin, sosatie & roosterkoek, fired to order.',
      code: 'BRAAI20',
      cta: 'See the braai',
      link: '/tabs/menu',
      tone: 'gold',
      icon: 'flame-outline',
    },
    {
      eyebrow: 'Sweet Treat',
      title: 'Buy 1, gift 1 Crème Brûlée',
      body: 'Share the caramelised French toast with someone you love this week.',
      code: 'DUOCRM',
      cta: 'Browse offers',
      link: '/tabs/offers',
      tone: 'ink',
      icon: 'gift-outline',
    },
    {
      eyebrow: 'Stay in',
      title: 'Free delivery over R200',
      body: 'Order the carte to your door — no delivery fee when your table tops R200.',
      code: 'FREE200',
      cta: 'Order now',
      link: '/tabs/cart',
      tone: 'gold',
      icon: 'bicycle-outline',
    },
  ];
  activePromo = 0;
  private reduceMotion = false;
  tableNumber: string | null = null;
  private tableSub = new Subscription();
  private promoSub?: Subscription;

  constructor(
    private cafeService: CafeService,
    private modalController: ModalController,
    private toastController: ToastController,
    private tableService: TableService,
  ) {
    addIcons({
      searchOutline,
      star,
      addOutline,
      heart,
      heartOutline,
      arrowForwardOutline,
      sparklesOutline,
      closeOutline,
      checkmarkDoneOutline,
      cafeOutline,
      flameOutline,
      giftOutline,
      bicycleOutline,
      chevronBackOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit() {
    this.setGreeting();
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.loadData();
    this.tableSub.add(
      this.tableService.table$.subscribe((t) => {
        this.tableNumber = t !== null ? String(t) : null;
      }),
    );
    this.tableSub.add(
      this.cafeService.profile$.subscribe((p) => {
        this.memberName = p?.name ? p.name.split(/\s+/)[0] : null;
      }),
    );
    if (!this.reduceMotion) {
      this.promoSub = interval(4500).subscribe(() => {
        if (!document.hidden) this.nextPromo();
      });
    }
  }

  ngOnDestroy() {
    this.tableSub.unsubscribe();
    this.promoSub?.unsubscribe();
    console.log(this.tableSub);
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour < 17) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }

  loadData() {
    this.isLoading = true;
    setTimeout(() => {
      this.menuItems = this.cafeService.getMenu();
      this.featuredItems = this.cafeService.getFeaturedItems();
      this.isLoading = false;
    }, 600);
  }

  // ---- Promotions carousel -----------------------------------------
  goToPromo(i: number): void {
    const n = this.promos.length;
    this.activePromo = ((i % n) + n) % n;
  }

  nextPromo(): void {
    this.goToPromo(this.activePromo + 1);
  }

  prevPromo(): void {
    this.goToPromo(this.activePromo - 1);
  }

  // ---- Filtering & sorting ----------------------------------------------
  get filteredItems(): MenuItem[] {
    const query = this.searchQuery.trim().toLowerCase();

    const filtered = this.menuItems
      .filter((item) => this.selectedCategory === 'all' || item.category === this.selectedCategory)
      .filter((item) => (this.featuredOnly ? item.featured : true))
      .filter((item) => {
        if (!query) return true;
        return (
          item.name.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query)
        );
      });

    return this.sortItems(filtered, this.sortKey);
  }

  sortItems(list: MenuItem[], key: SortKey): MenuItem[] {
    const copy = [...list];
    switch (key) {
      case 'rating':
        return copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'popularity':
      default:
        return copy.sort((a, b) => {
          const f = Number(!!b.featured) - Number(!!a.featured);
          if (f !== 0) return f;
          return (b.rating || 0) - (a.rating || 0);
        });
    }
  }

  // ---- Editorial grouping by course -------------------------------------
  get sections(): { key: string; label: string; items: MenuItem[] }[] {
    const items = this.filteredItems;
    if (this.searchQuery || this.selectedCategory !== 'all') {
      const label = this.searchQuery
        ? 'Search'
        : this.categoryLabel(this.selectedCategory as Category);
      return items.length ? [{ key: String(this.selectedCategory), label, items }] : [];
    }
    return CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c)).map((c) => ({
      key: c,
      label: this.categoryLabel(c),
      items: items.filter((i) => i.category === c),
    }));
  }

  categoryLabel(cat: Category): string {
    const labels: Record<string, string> = {
      morning: 'Morning',
      sharing: 'Sharing',
      salad: 'Salad',
      braai: 'Braai',
      side: 'Side',
      dessert: 'Dessert',
      drink: 'Drink',
    };
    return labels[cat] ?? cat;
  }

  get showTopSelection(): boolean {
    return !this.searchQuery;
  }

  // ---- Actions -----------------------------------------------------------
  setCategory(category: Category | 'all') {
    this.selectedCategory = category;
  }

  setSort(key: SortKey) {
    this.sortKey = key;
  }

  toggleFeaturedOnly() {
    this.featuredOnly = !this.featuredOnly;
    if (this.featuredOnly) {
      this.selectedCategory = 'all';
    }
  }

  clearFeaturedOnly() {
    this.featuredOnly = false;
  }

  // toggleShowAll() {
  //   this.showAllItems = !this.showAllItems;
  // }

  trackBySection(_: number, sec: { key: string }): string {
    return sec.key;
  }

  trackByItem(_: number, item: MenuItem): string {
    return item.id;
  }

  isFavorite(itemId: string): boolean {
    return this.cafeService.isFavorite(itemId);
  }

  async toggleFavorite(itemId: string) {
    this.cafeService.toggleFavorite(itemId);
    const saved = this.cafeService.isFavorite(itemId);
    const name = this.cafeService.getMenuItem(itemId)?.name ?? 'Dish';
    const toast = await this.toastController.create({
      message: saved ? `${name} saved to Favourites` : `${name} removed from Favourites`,
      duration: 1700,
      position: 'bottom',
      icon: saved ? 'heart' : 'heart-outline',
      cssClass: 'carte-toast',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await toast.present();
  }

  async addToCart(item: MenuItem) {
    this.cafeService.addToCart(item);
    const toast = await this.toastController.create({
      message: `${item.name} added to your table`,
      duration: 1700,
      position: 'bottom',
      icon: 'checkmark-done-outline',
      cssClass: 'carte-toast',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await toast.present();
  }

  async openDishSheet(item: MenuItem) {
    const modal = await this.modalController.create({
      component: DishSheetComponent,
      componentProps: { item },
      initialBreakpoint: 0.82,
      breakpoints: [0, 0.5, 0.82],
      backdropDismiss: true,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.action === 'add-to-cart') {
      this.addToCart(item);
    }
  }

  formatPrice(price: number): string {
    return `R ${price.toFixed(2)}`;
  }
}
