namespace PaymentService.DTOs
{
    public class VerifyPaymentResponse
    {
        public bool Success { get; set; }
        public string? TransactionId { get; set; }
        public string Status { get; set; } = "FAILED";
        public string? Message { get; set; }
    }
}
