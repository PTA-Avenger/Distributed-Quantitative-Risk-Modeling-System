using RiskEngine.Coordinator.GraphQL;
using RiskEngine.Coordinator.Services;

var builder = WebApplication.CreateBuilder(args);

// Ensure trailing slash for Grpc addresses isn't strictly required but best practice.
// Worker URLs configured in appsettings.json or use default for local testing
builder.Services.AddSingleton<RiskMetricsCalculator>();
builder.Services.AddSingleton<SimulationOrchestrator>();

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>();

var app = builder.Build();

app.MapGraphQL();
app.MapGet("/", () => "Risk Engine Coordinator running. Go to /graphql to execute queries.");

app.Run();
