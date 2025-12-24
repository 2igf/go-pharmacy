# GO Pharmacy - Project TODO

## Database & Schema
- [x] Design and implement database schema (products, doctors, appointments, medications, orders, prescriptions)
- [x] Create database migrations and push to database
- [x] Add database query helpers in server/db.ts

## Core Features - E-Commerce
- [x] Product catalog with categories (medications, medical supplies, natural products, etc.)
- [x] Product search and filtering functionality
- [x] Shopping cart management
- [x] Order management system
- [x] Prescription requirement handling for certain medications
- [ ] Delivery address management with map integration
- [x] Payment options (cash and card)
- [ ] Order tracking and delivery status

## Core Features - Doctor Services
- [x] Doctor profile management
- [x] Doctor search and filtering by specialty
- [x] Doctor ratings and reviews
- [x] Doctor consultation booking
- [x] Appointment scheduling with time slots
- [x] Doctor consultation (real-time or chat-based)

## Core Features - Medication Management
- [x] Medication reminder/scheduler (backend)
- [x] Medication schedule creation and management (UI)
- [ ] Notification system for medication reminders
- [ ] Medication history tracking

## UI Components & Pages
- [x] Landing/Home page with featured products and doctors
- [x] Product listing page
- [ ] Product detail page
- [x] Shopping cart page
- [ ] Checkout page (integrated in cart)
- [x] Doctor listing page
- [ ] Doctor detail page with booking options
- [x] Appointment booking page
- [ ] User profile/dashboard
- [ ] Order history page
- [x] Medication reminders dashboard
- [ ] Authentication pages (login/signup)

## Backend Services
- [x] tRPC procedures for products
- [x] tRPC procedures for doctors and appointments
- [x] tRPC procedures for orders and cart
- [x] tRPC procedures for medication reminders
- [x] tRPC procedures for prescriptions
- [ ] Notification service for medication reminders

## Testing
- [ ] Write vitest tests for core procedures
- [ ] Write vitest tests for database queries

## Design & Styling
- [ ] Establish design system and color palette
- [ ] Set up Tailwind CSS configuration
- [ ] Create reusable UI components
- [ ] Implement responsive design

## Additional Features (Optional/Future)
- [ ] User reviews and ratings for products
- [ ] Wishlist functionality
- [ ] Loyalty/rewards program
- [ ] Chat with pharmacist
- [ ] Video consultation with doctors
- [ ] Prescription upload and verification
- [ ] Insurance integration
- [ ] Multi-language support (Arabic/English)


## Redesign Tasks - Mobile App Style
- [x] Update color scheme to use #0cc46a as primary color
- [x] Redesign Home page to display products directly
- [x] Create mobile app-like navigation (bottom tab bar)
- [x] Update CSS and Tailwind theme colors
- [x] Improve product grid display in Home page
- [x] Add featured products section
- [x] Redesign header to match app style
- [ ] Update all pages to use new color scheme
- [x] Test responsive design on mobile devices


## Enhancement Tasks - Modern UI & Profile
- [x] Update icons to be more modern and trendy
- [x] Apply green color (#0cc46a) consistently across entire website
- [x] Add products carousel/grid directly on Home page
- [x] Add doctors carousel/grid directly on Home page
- [x] Make products and doctors browsable on Home page
- [x] Create User Profile page with account information
- [x] Add profile navigation to bottom nav bar
- [x] Improve color consistency in all components
- [x] Update button styles to match modern design


## Current Tasks - Color Scheme & Sample Data
- [x] Update color scheme from #0cc46a to #00c57d throughout entire website
- [x] Update all button colors to use new green shade
- [x] Update icon colors to match new scheme
- [x] Modernize icon designs (use more trendy icons)
- [x] Add sample/test medications to database
- [x] Add sample/test doctors to database
- [x] Redesign Home page to look like messaging apps (card-based layout)
- [x] Improve product card designs for better visual appeal
- [x] Add smooth animations and transitions


## Bug Fixes & Issues
- [x] Fix missing icons display in Home page (Icons are displaying correctly)
- [x] Ensure lucide-react icons render properly
- [x] Test icon visibility on different browsers


## Design Improvements
- [x] Improve Products page layout and filtering
- [x] Enhance Doctors page with better cards and information
- [ ] Add product detail page with full information
- [ ] Improve shopping cart UI/UX
- [x] Add animations and transitions throughout
- [x] Optimize mobile responsiveness
- [x] Add empty states for better UX
- [x] Improve search functionality

## Additional Sample Data
- [x] Add 10+ more medications to database
- [x] Add 5+ more doctors to database
- [x] Add product categories and subcategories
- [x] Add doctor specialties with descriptions
- [x] Add sample reviews and ratings


## Current Issues
- [x] Fix bottom navigation not showing on Home page


## Profile Page Integration
- [ ] Add Profile to bottom navigation bar
- [ ] Update all pages to include Profile in bottom nav
- [ ] Ensure Profile link works from all pages
