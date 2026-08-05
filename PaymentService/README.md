# PaymentService — ASP.NET Core Razorpay Microservice

## Overview

A standalone Payment Microservice built with **ASP.NET Core Web API (.NET 10)** that integrates **Razorpay Test Mode** for the Online Accommodation Portal. It handles order creation, payment signature verification, and persisting payment records in SQLite. After a successful payment it notifies the Spring Boot backend to confirm the booking.

---

## Project Structure

```
PaymentService/
├── Controllers/
│   └── PaymentController.cs          # REST API: create-order, verify, get by bookingId
├── DTOs/
│   ├── CreateOrderRequest.cs         # Input: bookingId, amount, currency
│   ├── CreateOrderResponse.cs        # Output: orderId, key, amount, currency
│   ├── VerifyPaymentRequest.cs       # Input: orderId, paymentId, signature
│   ├── VerifyPaymentResponse.cs      # Output: success, transactionId, status
│   └── PaymentDetailsDto.cs          # Output: payment record details
├── Data/
│   └── PaymentDbContext.cs           # EF Core SQLite DbContext
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs # Global JSON error responses
├── Models/
│   └── Payment.cs                    # Payment entity (persisted to SQLite)
├── Repositories/
│   ├── IPaymentRepository.cs         # Repository interface
│   └── PaymentRepository.cs          # EF Core implementation
├── Services/
│   ├── IPaymentService.cs            # Gateway-agnostic service interface
│   ├── IBookingIntegrationService.cs # Spring Boot integration interface
│   ├── RazorpayPaymentService.cs     # Razorpay implementation
│   └── BookingIntegrationService.cs  # Calls Spring Boot to confirm booking
├── Properties/
│   └── launchSettings.json           # Port 5050
├── appsettings.json                  # Keys, DB, URLs, CORS
└── Program.cs                        # DI, Swagger, EF Core, CORS, Middleware
```

---

## NuGet Packages

| Package | Version | Purpose |
|---|---|---|
| `Razorpay` | 3.1.3 | Razorpay .NET SDK (order creation) |
| `Microsoft.EntityFrameworkCore.Sqlite` | 9.0.1 | SQLite database via EF Core |
| `Swashbuckle.AspNetCore` | 7.2.0 | Swagger UI documentation |

---

## Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=payments.db"
  },
  "Razorpay": {
    "KeyId": "rzp_test_AktTDykGJhRmE7",
    "KeySecret": "YOUR_RAZORPAY_SECRET_KEY_HERE"
  },
  "SpringBoot": {
    "BaseUrl": "http://localhost:9090"
  },
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:8081"
  ]
}
```

> **⚠️ Important:** Replace `YOUR_RAZORPAY_SECRET_KEY_HERE` with your actual Razorpay Test Secret Key from the Razorpay Dashboard. Never commit the real secret to git.

---

## How to Run

### Prerequisites
- .NET 10 SDK installed
- Razorpay account (free) — [https://razorpay.com](https://razorpay.com)
- Spring Boot backend running on port `9090`

### Steps

```bash
# 1. Navigate to the PaymentService directory
cd d:\A CDAC KARAD\CdacProject\oas\PaymentService

# 2. Set your Razorpay Secret Key in appsettings.json
#    Replace: "KeySecret": "YOUR_RAZORPAY_SECRET_KEY_HERE"

# 3. Run the service
dotnet run

# Service starts on: http://localhost:5050
# Swagger UI at:     http://localhost:5050/swagger
# Health check:      http://localhost:5050/health
```

---

## Razorpay Test Mode Setup

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys
2. Generate **Test Mode** API Keys
3. Copy **Key ID** and **Key Secret**
4. Key ID (`rzp_test_AktTDykGJhRmE7`) is already configured in `appsettings.json`
5. Paste your **Key Secret** into `appsettings.json` under `Razorpay:KeySecret`

### Test Card Details (Test Mode)
| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

---

## API Endpoints

### Base URL: `http://localhost:5050`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payment/create-order` | None | Create Razorpay order |
| `POST` | `/api/payment/verify` | None | Verify payment signature |
| `GET` | `/api/payment/{bookingId}` | None | Get payment by booking ID |
| `GET` | `/health` | None | Service health check |
| `GET` | `/swagger` | None | Swagger UI |

---

## Sample Requests & Responses

### POST /api/payment/create-order
```json
// Request
{
  "bookingId": 1,
  "amount": 2500,
  "currency": "INR"
}

// Response (200 OK)
{
  "success": true,
  "orderId": "order_PQRxyz123",
  "amount": 2500,
  "currency": "INR",
  "key": "rzp_test_AktTDykGJhRmE7"
}
```

### POST /api/payment/verify
```json
// Request
{
  "bookingId": 1,
  "razorpay_order_id": "order_PQRxyz123",
  "razorpay_payment_id": "pay_ABCdef456",
  "razorpay_signature": "abcdef1234567890..."
}

// Success Response (200 OK)
{
  "success": true,
  "transactionId": "pay_ABCdef456",
  "status": "SUCCESS",
  "message": "Payment verified successfully"
}

// Failure Response (200 OK)
{
  "success": false,
  "status": "FAILED",
  "message": "Signature verification failed"
}
```

### GET /api/payment/1
```json
// Response (200 OK)
{
  "id": 1,
  "bookingId": 1,
  "amount": 2500.00,
  "currency": "INR",
  "orderId": "order_PQRxyz123",
  "paymentId": "pay_ABCdef456",
  "status": "SUCCESS",
  "paymentMethod": "Razorpay",
  "createdAt": "2026-08-04T17:45:00Z"
}
```

---

## Integration Flow

```
User clicks "Pay Now" (Bookings page)
        │
        ▼
POST /api/payment/create-order  →  PaymentService  →  Razorpay API
        │ (returns orderId + key)
        ▼
Razorpay Checkout Modal opens in browser
        │ (user completes payment)
        ▼
Razorpay returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        │
        ▼
POST /api/payment/verify  →  PaymentService
        │ (HMAC-SHA256 signature check)
        │ (update Payment record → SUCCESS)
        │
        ▼
PUT http://localhost:9090/api/bookings/{bookingId}/status?status=APPROVED
        │ (Spring Boot updates booking)
        ▼
Frontend shows: ✅ Payment Successful | Transaction ID | Booking Confirmed
```

---

## Spring Boot Integration

After payment verification, `BookingIntegrationService` calls:

```
PUT http://localhost:9090/api/bookings/{bookingId}/status?status=APPROVED
```

This uses the **existing** Spring Boot `BookingController.updateBookingStatus()` endpoint. No booking logic is duplicated in the PaymentService.

> **Note:** This call is fire-and-forget (best-effort). If Spring Boot is unavailable, the payment record is still marked `SUCCESS`.

---

## Adding Another Payment Gateway (e.g., Stripe)

The service is designed for extensibility:

1. Create `Services/StripePaymentService.cs` implementing `IPaymentService`
2. In `Program.cs`, change:
   ```csharp
   // From:
   builder.Services.AddScoped<IPaymentService, RazorpayPaymentService>();
   // To:
   builder.Services.AddScoped<IPaymentService, StripePaymentService>();
   ```
3. Add Stripe config to `appsettings.json`

No controller or repository changes needed.

---

## Swagger UI

**URL:** [http://localhost:5050/swagger](http://localhost:5050/swagger)

All 3 endpoints are documented with request/response schemas.

---

## Database

SQLite file `payments.db` is created automatically in the project root on first run.
EF Core `EnsureCreated()` creates the `Payments` table automatically — no migrations required.
