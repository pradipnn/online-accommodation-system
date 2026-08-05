using System.ComponentModel.DataAnnotations;

namespace PaymentService.DTOs
{
    public class CreateOrderRequest
    {
        [Required(ErrorMessage = "Booking ID is required")]
        public long BookingId { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(1, 1000000, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        public string Currency { get; set; } = "INR";
    }
}
