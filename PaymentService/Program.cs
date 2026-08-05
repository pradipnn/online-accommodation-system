using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Middleware;
using PaymentService.Repositories;
using PaymentService.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Controllers + JSON ──────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ─── Swagger / OpenAPI ───────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Payment Microservice API",
        Version = "v1",
        Description = "Razorpay payment gateway microservice for Online Accommodation Portal"
    });
});

// ─── EF Core SQLite ──────────────────────────────────────────────────────────
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=payments.db"));

// ─── HTTP Client for Spring Boot integration ─────────────────────────────────
builder.Services.AddHttpClient("SpringBoot", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["SpringBoot:BaseUrl"] ?? "http://localhost:9090");
    client.Timeout = TimeSpan.FromSeconds(10);
});

// ─── Dependency Injection ─────────────────────────────────────────────────────
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IBookingIntegrationService, BookingIntegrationService>();
builder.Services.AddScoped<IPaymentService, RazorpayPaymentService>();

// ─── CORS ────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:8081" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ─── Logging ──────────────────────────────────────────────────────────────────
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

// ─── Auto-create database on startup ─────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
    db.Database.EnsureCreated();
}

// ─── Middleware Pipeline ───────────────────────────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("AllowFrontend");

// ─── Swagger UI (always enabled for dev convenience) ─────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Payment Microservice API v1");
    c.RoutePrefix = "swagger";
});

// ─── Health check endpoint ─────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new { status = "UP", service = "PaymentService" }));

app.MapControllers();

app.Run();
