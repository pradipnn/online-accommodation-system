using System;

namespace PaymentService.DTOs
{
    public class PaymentDetailsDto
    {
        public long Id { get; set; }
        public long BookingId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string OrderId { get; set; } = string.Empty;
        public string? PaymentId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
