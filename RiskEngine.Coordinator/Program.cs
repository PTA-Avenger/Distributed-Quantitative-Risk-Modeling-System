using RiskEngine.Coordinator.GraphQL;
using RiskEngine.Coordinator.Services;
using RiskEngine.Coordinator.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// DB Context Setup
var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
string connectionString = "Host=localhost;Database=RiskEngine;Username=postgres;Password=postgres";

if (!string.IsNullOrEmpty(rawConnectionString) && rawConnectionString.Contains("://"))
{
    // Parse Render's postgres:// URI into a valid .NET Npgsql format
    var uri = new Uri(rawConnectionString);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Database={uri.LocalPath.Substring(1)};Username={userInfo[0]};Password={userInfo[1]};Port={(uri.Port > 0 ? uri.Port : 5432)};";
}
else if (!string.IsNullOrEmpty(rawConnectionString))
{
    connectionString = rawConnectionString;
}

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// Authentication Setup
var jwtKey = builder.Configuration["Jwt:Key"] ?? "VeryLongSecretStringForTestingBecauseThisIsPrototype";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

// Ensure trailing slash for Grpc addresses isn't strictly required but best practice.
// Worker URLs configured in appsettings.json or use default for local testing
builder.Services.AddSingleton<RiskMetricsCalculator>();
builder.Services.AddSingleton<SimulationOrchestrator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services
    .AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<Query>()
    .AddMutationType<AuthMutation>();

var app = builder.Build();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Automatically apply schema creation
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Safely creates the PostgreSQL tables on cold start
    db.Database.EnsureCreated();
}

app.MapGraphQL();
app.MapGet("/", () => "Risk Engine Coordinator running. Go to /graphql to execute queries.");

app.Run();
