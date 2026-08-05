using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace PaymentService.Services
{
    /// <summary>
    /// Calls the existing Spring Boot backend to confirm a booking after payment verification.
    /// Uses the existing endpoint: PUT /api/bookings/{bookingId}/status?status=APPROVED
    /// No booking logic is duplicated here.
    /// </summary>
    public class BookingIntegrationService : IBookingIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BookingIntegrationService> _logger;
        private readonly string _springBootBaseUrl;

        public BookingIntegrationService(
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<BookingIntegrationService> logger)
        {
            _httpClient = httpClientFactory.CreateClient("SpringBoot");
            _logger = logger;
            _springBootBaseUrl = config["SpringBoot:BaseUrl"]
                ?? "http://localhost:9090";
        }

        /// <summary>
        /// Calls Spring Boot PUT /api/bookings/{bookingId}/status?status=APPROVED
        /// to confirm a booking after successful Razorpay payment.
        /// This endpoint already exists in BookingController — no duplication needed.
        /// </summary>
        public async Task ConfirmBookingAsync(long bookingId)
        {
            try
            {
                string url = $"{_springBootBaseUrl}/api/bookings/{bookingId}/status?status=PAID";
                _logger.LogInformation("Confirming booking with Spring Boot: PUT {Url}", url);

                var response = await _httpClient.PutAsync(url, null);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Booking {BookingId} confirmed successfully by Spring Boot", bookingId);
                }
                else
                {
                    string body = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Spring Boot returned {StatusCode} when confirming booking {BookingId}: {Body}",
                        response.StatusCode, bookingId, body);
                }
            }
            catch (Exception ex)
            {
                // Log but do NOT rethrow — payment was already successful; booking confirm is best-effort
                _logger.LogError(ex, "Failed to confirm booking {BookingId} with Spring Boot. Payment was still successful.", bookingId);
            }
        }
    }
}
