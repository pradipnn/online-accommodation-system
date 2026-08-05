using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PaymentService.DTOs;
using PaymentService.Services;

namespace PaymentService.Controllers
{
    /// <summary>
    /// REST controller for Razorpay payment operations.
    /// Endpoints: create-order, verify, get payment by bookingId.
    /// </summary>
    [ApiController]
    [Route("api/payment")]
    [Produces("application/json")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        /// <summary>
        /// Creates a Razorpay payment order for a confirmed booking.
        /// Returns orderId and Razorpay key required to open Razorpay Checkout on the frontend.
        /// </summary>
        /// <param name="request">Booking ID, amount in INR, currency code</param>
        [HttpPost("create-order")]
        [ProducesResponseType(typeof(CreateOrderResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _logger.LogInformation("Create order request: BookingId={BookingId}, Amount={Amount}", request.BookingId, request.Amount);
            var result = await _paymentService.CreateOrderAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// Verifies the Razorpay payment signature after user completes checkout.
        /// On success: updates payment record to SUCCESS and confirms booking with Spring Boot.
        /// On failure: marks payment as FAILED.
        /// </summary>
        /// <param name="request">OrderId, PaymentId, and Signature from Razorpay callback</param>
        [HttpPost("verify")]
        [ProducesResponseType(typeof(VerifyPaymentResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _logger.LogInformation("Verify payment request: OrderId={OrderId}", request.RazorpayOrderId);
            var result = await _paymentService.VerifyPaymentAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves the latest payment record associated with a specific booking.
        /// </summary>
        /// <param name="bookingId">The booking ID to look up payment for</param>
        [HttpGet("{bookingId:long}")]
        [ProducesResponseType(typeof(PaymentDetailsDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetPaymentByBookingId(long bookingId)
        {
            var result = await _paymentService.GetPaymentByBookingIdAsync(bookingId);
            if (result == null)
                return NotFound(new { success = false, message = $"No payment found for booking {bookingId}" });

            return Ok(result);
        }
    }
}
