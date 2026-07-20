
# ☕ Lethabo Cafe - Ionic Angular MVP

A mobile-first MVP for **Lethabo Cafe**, built with **Ionic** and **Angular** using a tab-based navigation system. The app includes all the screens from the project brief — Home (Menu), Reviews, Scan, Cart, Profile/Account, and an Admin area — enhanced with **animated skeleton loaders** for a polished user experience.

![Ionic](https://img.shields.io/badge/Ionic-8-blue) ![Angular](https://img.shields.io/badge/Angular-20-red) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 📱 App Structure & Key Features

The app is built around **five main tabs** for easy navigation:

| Tab        | Route           | Purpose                                                                 |
| ---------- | --------------- | ----------------------------------------------------------------------- |
| **Menu**    | `/tabs/menu`    | Welcome screen with featured items and quick links to Details & Cart.   |
| **Reviews** | `/tabs/reviews` | Customer reviews with a link to the full review list.                   |
| **Scan**    | `/tabs/scan`    | Camera placeholder for QR / barcode scanning.                           |
| **Cart**    | `/tabs/cart`    | Empty-cart state and a demo view with items.                            |
| **Me**      | `/tabs/me`      | Account hub: Login, Create Account, Reset Password, Profile, Settings. |

### 👤 User & Admin Areas

- **Me tab** links to:
  - `Login` · `Create account` · `Reset password`
  - Full `Profile` view (editable name / email / phone)
  - `Settings` (toggles for notifications, dark mode, order updates)
  - `Help center` (FAQ accordion)
  - When **logged out**, the Me tab shows a **Sign-in gate** (Sign in / Create an account, plus a "browse as guest" link) instead of a blank screen — so guests always have a visible path to authenticate.
- **Admin** (standalone routes, reachable from the Me tab → Admin dashboard):
  - `Admin dashboard` – summary stat cards
  - `Admin reviews` – moderation actions (approve / delete)
  - `Admin flags` – resolve flagged content

### 📄 Additional Pages (fully linked)

A comprehensive set of auxiliary pages is included, accessible via the router:

- `Details` · `All Reviews` · `Favorites`
- `Privacy` · `Terms` · `Copyright` · `Dispute`
- `Changelog` · `Community` · `Help Center`
- `404` (not found) for unknown routes

---

## 🦴 Skeleton Pages Feature

All pages include **animated skeleton loaders** that provide visual feedback during content loading. This enhances the user experience by:

- **Reducing perceived wait time** – Users see a structured layout loading immediately.
- **Preventing layout shifts** – Skeleton elements maintain the page structure.
- **Creating a polished feel** – Smooth shimmer animations make the app feel responsive.

Each page shows skeleton elements while `loading` is `true`, then swaps to real content. The shimmer effect is defined once in `src/global.scss` (the `lc-skeleton` utility) and uses Ionic's built-in `ion-skeleton-text` where appropriate.

---

## 🚀 Getting Started

This is a standard **Ionic Angular** project. It requires Node.js and a package install — it is **not** a single static HTML file.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS, v18+)
- npm (ships with Node)

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens at http://localhost:8100 by default)
npm start
# or: npx ionic serve
```

The app will compile and serve; open the printed localhost URL in your browser (use device emulation for a mobile view).

### Production Build

```bash
npm run build          # production build into /dist
# or a lighter dev build:
npx ng build --configuration development
```

> **Note:** If the build runs out of memory on a constrained environment, raise Node's heap first:
> `export NODE_OPTIONS="--max-old-space-size=2048" && npm run build`

---

## 🧭 Navigation & Routing

Routing uses the **Angular Router** with a tab-based structure.

- **Entry / onboarding:** `/` redirects to `/welcome` — a full-screen onboarding screen. `welcomeGuard` shows it once; returning visitors who have already seen it are routed straight to `/tabs/menu` via the `cafe-welcome-seen` localStorage flag.
- **Default (post-onboarding) route:** `/tabs/menu`
- **Tab routes:**
  - `/tabs/menu` → `MenuPage`
  - `/tabs/reviews` → `ReviewsTabPage`
  - `/tabs/scan` → `ScanTabPage`
  - `/tabs/cart` → `CartTabPage`
  - `/tabs/me` → `MePage`
- **Standalone routes** (lazy-loaded, accessible via buttons or direct URL):
  - `/welcome` (onboarding, guarded by `welcomeGuard`)
  - `/details`, `/all-reviews`, `/favorites`
  - `/profile`, `/login`, `/create-account`, `/reset-password`
  - `/settings`, `/help-center`
  - `/privacy`, `/terms`, `/copyright`, `/dispute`, `/changelog`, `/community`
  - `/admin-dashboard`, `/admin-reviews`, `/admin-flags`
- **Wildcard:** `**` → 404 page

---

## 🛠️ Tech Stack

| Technology                                                | Version | Purpose                                         |
| --------------------------------------------------------- | ------- | ----------------------------------------------- |
| [Ionic Framework](https://ionicframework.com/)            | 8.x     | UI components and mobile gestures               |
| [Angular](https://angular.io/)                            | 20.x    | Standalone components, routing, dependency injection |
| [TypeScript](https://www.typescriptlang.org/)             | 5.x     | Typed JavaScript                                |
| [Angular Router](https://angular.io/guide/router)         | 20.x    | Navigation and deep linking                     |
| [Capacitor](https://capacitorjs.com/)                    | 8.x     | Native runtime (optional mobile builds)         |

All dependencies are installed via npm — there are **no CDN imports**.

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── app.component.ts/html/scss     # root shell (ion-app + router outlet)
│   ├── app.routes.ts                  # root routes + 404 wildcard
│   ├── tabs/
│   │   ├── tabs.page.ts/html/scss     # tab bar (5 tabs)
│   │   ├── tabs.routes.ts             # lazy tab routes
│   │   ├── menu/   reviews/  scan/    # tab pages
│   │   ├── cart/  me/
│   │   └── tabs.page.spec.ts
│   └── pages/                         # standalone (non-tab) pages
│       ├── details/  all-reviews/  favorites/
│       ├── profile/  login/  create-account/  reset-password/
│       ├── settings/  help-center/
│       ├── privacy/  terms/  copyright/  dispute/
│       ├── changelog/  community/
│       ├── admin-dashboard/  admin-reviews/  admin-flags/
│       └── not-found/                 # 404
├── assets/                            # icons, shapes
├── theme/variables.scss               # Ionic theme variables
├── global.scss                        # global + skeleton utilities
├── index.html
├── main.ts                            # Angular bootstrap
└── environments/                      # env config
```

Each page is a **standalone Angular component** (its own `imports` array) with `page.ts`, `page.html`, and `page.scss` files.

---

## 🔮 Future Enhancements

- Replace static data with REST API calls (products, reviews, cart items)
- Connect skeleton loaders to real loading states (signals / observables)
- Add real authentication (JWT, Firebase Auth)
- Implement scan functionality using the Capacitor Camera plugin
- Connect the admin dashboard to live metrics
- Add state management (signals / NgRx) for cart and user sessions
- Implement a real checkout & payment flow (Stripe, PayPal)
- Write unit and e2e tests
- Implement dark mode support
- Add push notifications

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- Built for **Lethabo Cafe** – good luck with your MVP! ☕
- Icons provided by [Ionicons](https://ionicons.com/)
- Inspired by the simplicity of mobile-first design
- Skeleton loading pattern inspired by modern UI/UX best practices

---

**Enjoy your coffee! ☕**
