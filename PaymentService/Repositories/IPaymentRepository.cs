using System.Threading.Tasks;
using PaymentService.Models;

namespace PaymentService.Repositories
{
    public interface IPaymentRepository
    {
        Task<Payment> CreateAsync(Payment payment);
        Task<Payment?> GetByIdAsync(long id);
        Task<Payment?> GetByOrderIdAsync(string orderId);
        Task<Payment?> GetByBookingIdAsync(long bookingId);
        Task<Payment> UpdateAsync(Payment payment);
    }
}
