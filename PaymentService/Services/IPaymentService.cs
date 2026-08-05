using System.Threading.Tasks;
using PaymentService.DTOs;

namespace PaymentService.Services
{
    /// <summary>
    /// Interface for payment gateway operations.
    /// Implement this interface to add another payment gateway (e.g., Stripe) with minimal changes.
    /// </summary>
    public interface IPaymentService
    {
        /// <summary>Creates an order on the payment gateway and persists a payment record.</summary>
        Task<CreateOrderResponse> CreateOrderAsync(CreateOrderRequest request);

        /// <summary>Verifies the payment signature and updates the persisted payment record.</summary>
        Task<VerifyPaymentResponse> VerifyPaymentAsync(VerifyPaymentRequest request);

        /// <summary>Returns the latest payment record for a given booking.</summary>
        Task<PaymentDetailsDto?> GetPaymentByBookingIdAsync(long bookingId);
    }
}
