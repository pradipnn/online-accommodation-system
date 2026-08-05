using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Razorpay.Api;
using PaymentService.DTOs;
using PaymentService.Models;
using PaymentService.Repositories;

namespace PaymentService.Services
{
    /// <summary>
    /// Razorpay implementation of IPaymentService.
    /// To add Stripe or another gateway, create a new class implementing IPaymentService and register it in Program.cs.
    /// </summary>
    public class RazorpayPaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repository;
        private readonly IBookingIntegrationService _bookingService;
        private readonly IConfiguration _config;
        private readonly ILogger<RazorpayPaymentService> _logger;

        private readonly string _keyId;
        private readonly string _keySecret;

        public RazorpayPaymentService(
            IPaymentRepository repository,
            IBookingIntegrationService bookingService,
            IConfiguration config,
            ILogger<RazorpayPaymentService> logger)
        {
            _repository = repository;
            _bookingService = bookingService;
            _config = config;
            _logger = logger;

            _keyId = _config["Razorpay:KeyId"]
                ?? throw new InvalidOperationException("Razorpay:KeyId is not configured.");
            _keySecret = _config["Razorpay:KeySecret"]
                ?? throw new InvalidOperationException("Razorpay:KeySecret is not configured.");
        }

        /// <summary>
        /// Creates a Razorpay order and persists a Payment record with status CREATED.
        /// Amount is converted to paise (Razorpay requires smallest currency unit).
        /// </summary>
        public async Task<CreateOrderResponse> CreateOrderAsync(CreateOrderRequest request)
        {
            _logger.LogInformation("Creating Razorpay order for BookingId={BookingId}, Amount={Amount}", request.BookingId, request.Amount);

            try
            {
                var client = new RazorpayClient(_keyId, _keySecret);

                var options = new Dictionary<string, object>
                {
                    { "amount", (long)(request.Amount * 100) }, // Convert to paise
                    { "currency", request.Currency },
                    { "receipt", $"receipt_booking_{request.BookingId}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" },
                    { "payment_capture", 1 }
                };

                Order rzpOrder = client.Order.Create(options);
                string orderId = rzpOrder["id"].ToString()!;

                _logger.LogInformation("Razorpay order created successfully: OrderId={OrderId}", orderId);

                // Persist payment record
                var payment = new PaymentService.Models.Payment
                {
                    BookingId = request.BookingId,
                    Amount = request.Amount,
                    Currency = request.Currency,
                    OrderId = orderId,
                    Status = "CREATED",
                    PaymentMethod = "Razorpay"
                };
                await _repository.CreateAsync(payment);

                return new CreateOrderResponse
                {
                    Success = true,
                    OrderId = orderId,
                    Amount = request.Amount,
                    Currency = request.Currency,
                    Key = _keyId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create Razorpay order for BookingId={BookingId}", request.BookingId);
                return new CreateOrderResponse
                {
                    Success = false,
                    Message = $"Razorpay order creation failed: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Verifies the Razorpay payment signature using HMAC-SHA256.
        /// Formula: HMAC_SHA256(orderId + "|" + paymentId, keySecret)
        /// On success, updates the payment record and notifies Spring Boot.
        /// </summary>
        public async Task<VerifyPaymentResponse> VerifyPaymentAsync(VerifyPaymentRequest request)
        {
            _logger.LogInformation("Verifying payment: OrderId={OrderId}, PaymentId={PaymentId}",
                request.RazorpayOrderId, request.RazorpayPaymentId);

            bool isValid = VerifySignature(request.RazorpayOrderId, request.RazorpayPaymentId, request.RazorpaySignature);

            var payment = await _repository.GetByOrderIdAsync(request.RazorpayOrderId);

            if (payment == null)
            {
                _logger.LogWarning("Payment record not found for OrderId={OrderId}", request.RazorpayOrderId);
                return new VerifyPaymentResponse { Success = false, Status = "FAILED", Message = "Payment record not found" };
            }

            if (!isValid)
            {
                _logger.LogWarning("Signature verification FAILED for OrderId={OrderId}", request.RazorpayOrderId);
                payment.Status = "FAILED";
                payment.PaymentId = request.RazorpayPaymentId;
                await _repository.UpdateAsync(payment);

                return new VerifyPaymentResponse { Success = false, Status = "FAILED", Message = "Signature verification failed" };
            }

            // Update payment record with verified data
            payment.PaymentId = request.RazorpayPaymentId;
            payment.Signature = request.RazorpaySignature;
            payment.Status = "SUCCESS";
            await _repository.UpdateAsync(payment);

            _logger.LogInformation("Payment verified successfully: TransactionId={PaymentId}", request.RazorpayPaymentId);

            // Notify Spring Boot to confirm booking
            await _bookingService.ConfirmBookingAsync(payment.BookingId);

            return new VerifyPaymentResponse
            {
                Success = true,
                TransactionId = request.RazorpayPaymentId,
                Status = "SUCCESS",
                Message = "Payment verified successfully"
            };
        }

        /// <summary>Returns the latest payment record for the given booking ID.</summary>
        public async Task<PaymentDetailsDto?> GetPaymentByBookingIdAsync(long bookingId)
        {
            var payment = await _repository.GetByBookingIdAsync(bookingId);
            if (payment == null) return null;

            return new PaymentDetailsDto
            {
                Id = payment.Id,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                Currency = payment.Currency,
                OrderId = payment.OrderId,
                PaymentId = payment.PaymentId,
                Status = payment.Status,
                PaymentMethod = payment.PaymentMethod,
                CreatedAt = payment.CreatedAt
            };
        }

        /// <summary>
        /// Verifies Razorpay signature using HMAC-SHA256.
        /// Expected signature = HMAC_SHA256(orderId + "|" + paymentId, KeySecret)
        /// </summary>
        private bool VerifySignature(string orderId, string paymentId, string signature)
        {
            try
            {
                string payload = $"{orderId}|{paymentId}";
                using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_keySecret));
                byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                string expected = BitConverter.ToString(hash).Replace("-", "").ToLower();
                return expected == signature;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Razorpay signature");
                return false;
            }
        }
    }
}
