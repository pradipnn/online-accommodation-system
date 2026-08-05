using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PaymentService.DTOs
{
    public class VerifyPaymentRequest
    {
        [Required(ErrorMessage = "Booking ID is required")]
        public long BookingId { get; set; }

        [Required(ErrorMessage = "Razorpay Order ID is required")]
        [JsonPropertyName("razorpay_order_id")]
        public string RazorpayOrderId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Razorpay Payment ID is required")]
        [JsonPropertyName("razorpay_payment_id")]
        public string RazorpayPaymentId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Razorpay Signature is required")]
        [JsonPropertyName("razorpay_signature")]
        public string RazorpaySignature { get; set; } = string.Empty;
    }
}
