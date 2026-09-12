```markdown
# EthioSource: Cross-Border E-Commerce & Dropshipping Platform

**Business Model:** B2B2C (From Chinese Suppliers to Ethiopian Buyers)
**Target Platforms:** Responsive Web Platform (Client & Admin), installable as a Progressive Web App (PWA) on supported mobile and desktop browsers. Native Android and iOS applications are excluded from the current scope.

```

---

## 1. Project Objective

**EthioSource** will serve as a digital bridge between Chinese manufacturers and Ethiopian customers. The platform allows users to browse imported products in local languages, process payments using domestic mobile banking (in ETB), and track their cargo from Chinese ports directly to Ethiopia through an automated, visually stunning, and highly responsive system.

## 2. System Architecture & Features

* **Customer Facing Client:** Features a categorized product catalog localized in Amharic, Afaan Oromoo, and English. Designed to be highly optimized and fast.
* **Web-Based Admin Dashboard:** Enables content management, tracks successful/failed payments, and features a Currency Exchange Engine that automatically updates product prices from USD/CNY to Ethiopian Birr (ETB).
* **Complete Authentication:** Secure, seamless Sign-in and Sign-up flows with role-based access control (Admin vs. Customer).
* **Supplier API Integration:** Automatically syncs product prices, photos, and stock levels daily. If an item runs out at the Chinese warehouse, EthioSource instantly updates it to "Out of Stock".
* **Order & Cargo Tracking:** Real-time updates as the order moves through stages: *Order Confirmed ➡️ Shipped from China ➡️ Arrived at Customs/Modjo Port ➡️ Ready for Pickup*.

---

## 3. Technical Architecture & Design Patterns

The web application and admin dashboard will be built using a cutting-edge, modern tech stack designed for premium performance, real-time capabilities, and an elite user experience.

### Framework & Routing

* **Core Framework:** The latest **Next.js** (App Router).
* **Runtime & Package Manager:** **Bun**, with the official `create-next-app` starter.
* **Grouped Routing Architecture:** Strict separation of concerns using Next.js route groups:
* `(client)` **Group:** Client-facing routes operating at the root level (no prefix) for a clean URL structure (e.g., `/products`, `/checkout`).
* `(admin)` **Group:** Administrator features strictly routed under the `/admin` prefix.



### Backend & State Management

* **Database & Backend:** **Convex** will be utilized as the real-time database and backend function engine, ensuring instant updates across the client and admin platforms.
* **State Management:** **Zustand** for lightweight, scalable, and boilerplate-free client-side state management.

### UI/UX & Aesthetics

* **Apple Design Pattern:** The entire platform will be designed to feel as if it were developed by Apple's design team. This means a premium, minimalist aesthetic, generous white space, polished typography, and highly intuitive navigation.
* **UI Components:** Built upon **Shadcn UI** to ensure accessible, beautifully crafted base components that are heavily customized to fit the Apple aesthetic.
* **Motions & Animations:** Fluid, physics-based micro-interactions and page transitions (e.g., Framer Motion) to make the user experience feel incredibly smooth and native.
* **Progressive Web App:** Home-screen installation, application icons, and a safe offline reconnect screen. Shopping, payment, and real-time tracking require connectivity; private account and payment data must not be cached offline.

### Configuration & Security

* **Environment Variables:** System-level configurations will be strictly managed via `.env` files.
* **Typed Config:** A dedicated `config/env.ts` file will be used to parse, validate, and export environment variables throughout the application to prevent runtime errors.

---

## 4. Code Quality & Best Practices

The codebase must be engineered for long-term scalability and easy maintenance by following strict software engineering principles:

* **OOP Principles:** Utilize Object-Oriented Programming (OOP) and ES6 classes wherever appropriate, particularly for external service integrations, complex utility layers, and data formatting.
* **DRY Principle:** "Don't Repeat Yourself." Absolutely no duplicated code. UI components and utility functions must be highly reusable across both the `(client)` and `(admin)` environments.
* **Modular Folder Structure:** A meticulously refactored and predictable directory structure (e.g., separating `/components/ui`, `/components/shared`, `/lib/utils`, `/services/api`, and `/config`).

---

## 5. Payment Gateways & Deliverables

* **Local Payment APIs:** **Chapa first**, utilizing verified webhook confirmations. Available domestic payment methods depend on the Chapa merchant configuration. Direct Telebirr, CBE Birr, and Arifpay connectors are deferred.
* **Supplier:** Provider selection is pending. Implement a configurable daily feed integration; finalize vendor-specific endpoints and immediate inventory events after choosing the supplier.
* **Deliverables:** Web client and admin source code, installable PWA, cloud hosting configuration, and technical documentation. Production hosting and merchant activation require operator accounts and credentials. Native mobile app deployments are excluded; post-launch maintenance requires an ongoing support arrangement.

---

## 6. Market Context & Competitive Advantage

While global apps like *SourcinBox* fail in Ethiopia due to a lack of local payment integration, **EthioSource** perfectly bridges this gap. It will completely automate and modernize the currently cluttered, manual dropshipping businesses operating via Telegram channels in Addis Ababa, doing so with a world-class, premium software experience.

```

```
