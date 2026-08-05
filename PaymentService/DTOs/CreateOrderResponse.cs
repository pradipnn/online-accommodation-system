namespace PaymentService.DTOs
{
    public class CreateOrderResponse
    {
        public bool Success { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string Key { get; set; } = string.Empty;
        public string? Message { get; set; }
    }
}
