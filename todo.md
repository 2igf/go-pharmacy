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
- [ ] Doctor consultation booking
- [ ] Appointment scheduling with time slots
- [ ] Doctor consultation (real-time or chat-based)

## Core Features - Medication Management
- [x] Medication reminder/scheduler (backend)
- [ ] Medication schedule creation and management (UI)
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
- [ ] Appointment booking page
- [ ] User profile/dashboard
- [ ] Order history page
- [ ] Medication reminders dashboard
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
