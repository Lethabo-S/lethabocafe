export type Category = "morning" | "sharing" | "salad"| "braai" | "side" | "dessert" | "drink";

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  desc: string;
  price: number;
  emoji: string;
  featured?: boolean;
  tag?: string;
  rating?: number;
}

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "morning", label: "Morning" },
  { id: "sharing", label: "Sharing" },
  { id: "salad", label: "Salad" },
  { id: "braai", label: "Braai" },
  { id: "side", label: "Side" },
  { id: "dessert", label: "Dessert" },
  { id: "drink", label: "Drink" },
];

export const MENU: MenuItem[] = [
  { id: "pbj", name: "Peanut Butter & Jelly", category: "morning", desc: "French brioche, peanut butter, strawberry", price: 60, emoji: "🥜", featured: true, tag: "Chef's pick", rating: 4.9 },
  { id: "shak", name: "Shakchouka", category: "morning", desc: "Capsicum tomato sauce, egg, labneh, zatar, feta", price: 48, emoji: "🍳", rating: 4.7 },
  { id: "cream", name: "La Crème Brûlée", category: "morning", desc: "Caramelized french toast, English cream, red currant", price: 55, emoji: "🍮", featured: true, tag: "Trending", rating: 4.8 },
  { id: "um-ali", name: "Um Ali French Toast", category: "morning", desc: "Brioche, milk & cream, nuts, saffron", price: 55, emoji: "🍞", rating: 4.6 },
  { id: "agapi", name: "Agapi", category: "morning", desc: "Homemade granola, Greek yogurt, red fruit, herbs", price: 45, emoji: "🥣", rating: 4.5 },
  { id: "halloumi-garden", name: "Halloumi Garden", category: "morning", desc: "Labneh zatar, grilled halloumi, cherry tomatoes, olives", price: 40, emoji: "🧀", rating: 4.4 },
  { id: "waffle", name: "Enchanted Waffle", category: "morning", desc: "Crispy waffle, custard Nutella, berries sauce", price: 45, emoji: "🧇", featured: true, tag: "Loved", rating: 4.8 },
  { id: "halloumi-fries", name: "Abi Halloumi Fries", category: "sharing", desc: "Crispy halloumi, zaatar, labneh dip, grenadine molasses", price: 49, emoji: "🍟", rating: 4.7 },
  { id: "prawn", name: "Roasted Prawn", category: "sharing", desc: "Roasted shrimp, Yuzu harissa sauce", price: 70, emoji: "🦐", featured: true, tag: "Signature", rating: 4.9 },
  { id: "truffle", name: "Perfetto Truffle Fries", category: "sharing", desc: "Crispy fries, truffle sauce, parmesan cheese", price: 36, emoji: "🍟", rating: 4.6 },
  { id: "burrata", name: "Io Amo La Burrata", category: "sharing", desc: "Carpaccio beetroot, parmesan fondue, burrata, cherry tomato, mint", price: 59, emoji: "🧀", featured: true, tag: "New", rating: 4.8 },
  { id: "corn", name: "I Love Corn & Cheese", category: "sharing", desc: "Charred corn, cheese mushroom sauce, sesame", price: 45, emoji: "🌽", rating: 4.4 },
  { id: "calamari", name: "Original Calamari", category: "sharing", desc: "Deep fried calamari, dynamite sauce", price: 40, emoji: "🦑", rating: 4.5 },
  { id: "caesar", name: "Hotel Caesar", category: "salad", desc: "Grilled gem lettuce, chicken, crispy bread, halva tomato", price: 55, emoji: "🥗", rating: 4.6 },
  { id: "boerie", name: "Boerewors Roll", category: "braai", desc: "Classic farmer's sausage, grilled to perfection, served with a tangy tomato & onion relish", price: 85, emoji: "🌭", featured: true, tag: "National Treasure", rating: 4.8 },
  { id: "sosatie", name: "Apricot & Lamb Sosatie", category: "braai", desc: "Marinated lamb skewers with apricots, onion, and a curried chutney glaze", price: 95, emoji: "🍢", featured: false, tag: "Sweet & Savory", rating: 4.7 },
  { id: "snoek", name: "Braaied Snoek", category: "braai", desc: "Fresh line fish, butterflied and basted with apricot jam, lemon & spices", price: 110, emoji: "🐟", featured: false, tag: "Catch of the Day", rating: 4.6 },
  { id: "steak", name: "Coffee-Spiced Sirloin", category: "braai", desc: "Grass-fed sirloin rubbed with coffee, brown sugar, and coriander", price: 130, emoji: "🥩", featured: true, tag: "Fire & Smoke", rating: 4.9 },
  { id: "chakalaka", name: "Chakalaka Relish", category: "side", desc: "Spicy vegetable relish with beans, peppers, and curry spices", price: 35, emoji: "🌶️", featured: false, tag: "Adds Heat", rating: 4.5 },
  { id: "pap", name: "Pap & Sous", category: "side", desc: "Creamy maize porridge served with a savory tomato & onion gravy", price: 30, emoji: "🍲", featured: false, tag: "Classic Staple", rating: 4.4 },
  { id: "melktert", name: "Melktert (Milk Tart)", category: "dessert", desc: "Creamy custard tart with a crisp pastry crust, dusted with cinnamon", price: 45, emoji: "🥧", featured: true, tag: "Sweet Finish", rating: 4.7 },
  { id: "moerkoffie", name: "Moerkoffie", category: "drink", desc: "Traditional coffee brewed slow and dark over the fire", price: 25, emoji: "☕", featured: false, tag: "Potbrewed", rating: 4.3 },
  { id: "roosterkoek", name: "Roosterkoek", category: "braai", desc: "Griddled bread rolls, toasted over the coals until golden", price: 20, emoji: "🍞", featured: false, tag: "Braai Bread", rating: 4.5 }
];

export const FEATURED = MENU.filter((m) => m.featured);

export const formatR = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);

