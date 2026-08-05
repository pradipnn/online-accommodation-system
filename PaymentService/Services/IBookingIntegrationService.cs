using System.Threading.Tasks;

namespace PaymentService.Services
{
    public interface IBookingIntegrationService
    {
        Task ConfirmBookingAsync(long bookingId);
    }
}
