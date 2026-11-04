# Hotel Food Ordering System

Full implementation of the spec in `Hotel_Food_Ordering_Final_Documentation...docx`:
guest checkout (no accounts), UPI/card payments via Razorpay, secure order tracking,
admin dashboard, and AWS-ready deployment structure.

- **Backend:** Java 21, Spring Boot 3, Spring Security (JWT for admin only), MySQL, Flyway
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS

```
hotel-food-ordering/
├── backend/    Spring Boot API (port 8080)
└── frontend/   React app (port 5173)
```

## 1. Prerequisites

- Java 21 (`java -version`)
- Maven (bundled via `mvnw` is not included — install Maven 3.8+ or use your IDE)
- Node.js 18+ and npm
- MySQL 8.x running locally (or Docker)
- A free Razorpay account in **Test Mode** (https://dashboard.razorpay.com) for the Key ID / Key Secret

## 2. Database setup

```sql
CREATE DATABASE hotel_food_ordering CHARACTER SET utf8mb4;
CREATE USER 'foodapp'@'localhost' IDENTIFIED BY 'change-this-password';
GRANT ALL PRIVILEGES ON hotel_food_ordering.* TO 'foodapp'@'localhost';
FLUSH PRIVILEGES;
```

Flyway migrations run automatically on backend startup and will create all tables
plus sample categories, food items, a delivery partner, and one admin login:

```
Email:    admin@hotel.com
Password: Admin@12345
```

**Change this password before going anywhere near production.**

## 3. Run the backend

```bash
cd backend
export DB_USERNAME=foodapp
export DB_PASSWORD=change-this-password
export JWT_SECRET=$(openssl rand -hex 32)
export RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
export RAZORPAY_KEY_SECRET=your_test_key_secret
export RAZORPAY_WEBHOOK_SECRET=any_string_you_also_put_in_the_razorpay_dashboard
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. Check `GET http://localhost:8080/api/categories`
in a browser — you should see the 5 seeded categories as JSON.

All configuration is in `backend/src/main/resources/application.yml` and can be overridden
with the environment variables shown there (`DB_HOST`, `DB_PORT`, `CORS_ALLOWED_ORIGINS`,
`AWS_S3_ENABLED`, etc). If you don't set AWS credentials, food image uploads are saved
to a local `backend/uploads/` folder automatically — that's fine for local testing.

## 4. Run the frontend

```bash
cd frontend
npm install
cp .env.example .env      # defaults to http://localhost:8080, edit if needed
npm run dev
```

Open **http://localhost:5173**.

- Customer site: `/`, `/menu`, `/cart`, `/checkout`, `/track`
- Admin panel: `/admin/login` → log in with the seeded admin above

## 5. Testing a full order locally

1. Go to `/menu`, add a few items, go to checkout, fill in name/mobile/address.
2. On the payment screen, the Razorpay checkout modal opens. In **Test Mode** you can pay with:
   - Test UPI VPA: `success@razorpay`
   - Test card: `4111 1111 1111 1111`, any future expiry, any CVV
3. You'll land on the order confirmation screen with the order number and tracking link.
4. Log in to `/admin/login`, open the order under **Orders**, assign the seeded delivery
   partner ("Ravi Kumar"), and walk it through CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED.
5. Back on the customer side, open the tracking link (or paste it into `/track`) to see the
   delivery partner's number and a **Call** button appear.

### Webhook testing (optional, recommended before going live)

Razorpay webhooks need a public HTTPS URL. Use the Razorpay CLI or `ngrok http 8080` to expose
your local backend, then set that URL + your `RAZORPAY_WEBHOOK_SECRET` under
**Dashboard → Webhooks**, subscribing to `payment.captured` and `payment.failed`.

## 6. Before you deploy to AWS

This matches Section 24 ("Pre-Launch Checklist") of the original spec:

- [ ] Replace all seeded menu items with your real menu and prices
- [ ] Rotate the seeded admin password
- [ ] Switch Razorpay from Test Mode keys to Live Mode keys
- [ ] Set `AWS_S3_ENABLED=true` with a real bucket for food images (EC2/local disk doesn't
      persist across deployments)
- [ ] Point `DB_HOST`/`DB_PORT` at your RDS MySQL instance; run with `ddl-auto: validate`
      (already set) so Flyway — not Hibernate — owns schema changes
- [ ] Set `CORS_ALLOWED_ORIGINS` to your real domain (CloudFront/S3 URL or custom domain)
- [ ] Put the backend behind HTTPS (ACM certificate + ALB, or Nginx + Let's Encrypt on EC2)
- [ ] Store all secrets (`JWT_SECRET`, DB password, Razorpay keys) in AWS Secrets Manager,
      not in plain environment variables on the instance
- [ ] Enable RDS automated backups and CloudWatch logging

## Project structure reference

See the original documentation for the full design rationale (server-side pricing,
order-number/tracking-token generation, status machine, etc.) — the backend code follows
it section-by-section: `order/service/OrderService.java` is the core of guest checkout,
`payment/service/PaymentService.java` is the Razorpay integration and webhook handling.
