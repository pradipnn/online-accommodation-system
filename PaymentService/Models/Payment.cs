using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentService.Models
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Required]
        public long BookingId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = "INR";

        [Required]
        [MaxLength(100)]
        public string OrderId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? PaymentId { get; set; }

        [MaxLength(255)]
        public string? Signature { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "CREATED"; // CREATED, SUCCESS, FAILED, REFUNDED

        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Razorpay";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
