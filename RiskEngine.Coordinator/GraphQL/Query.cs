using RiskEngine.Coordinator.Services;
using RiskEngine.Protos;

namespace RiskEngine.Coordinator.GraphQL;

public class Query
{
    public async Task<SimulationResultPayload> GetPortfolioRiskAsync(
        [Service] SimulationOrchestrator orchestrator,
        int numberOfPaths = 100000,
        double confidenceLevel = 0.99,
        double timeHorizonYears = 1.0)
    {
        // For demonstration, we build a dummy portfolio with 2 correlated assets.
        // In a real system, these would be passed in or fetched from a database.
        
        var request = new SimulationRequest
        {
            NumberOfPaths = numberOfPaths,
            TimeHorizonYears = timeHorizonYears,
            TimeSteps = 252, // Daily steps in trading year
            PortfolioSize = 2,
            InitialPortfolioValue = 100000.0,
        };

        request.InitialPrices.AddRange(new[] { 150.0, 200.0 });
        request.Weights.AddRange(new[] { 0.6, 0.4 });
        request.Drifts.AddRange(new[] { 0.08, 0.12 });
        request.Volatilities.AddRange(new[] { 0.20, 0.25 });

        // Cholesky decomposition of a 2x2 correlation matrix with rho = 0.5
        // [1.0, 0.5]
        // [0.5, 1.0] -> Cholesky Lower Triangle:
        // L11 = 1.0
        // L21 = 0.5, L22 = sqrt(1 - 0.5^2) = 0.866025
        // Flattened row-major: [1.0, 0.0, 0.5, 0.866025]
        request.CholeskyMatrix.AddRange(new[] { 1.0, 0.0, 0.5, 0.866025 });

        var metrics = await orchestrator.RunDistributedSimulationAsync(request, confidenceLevel);

        return new SimulationResultPayload
        {
            ValueAtRisk = metrics.ValueAtRisk,
            ExpectedShortfall = metrics.ExpectedShortfall,
            ConfidenceLevel = confidenceLevel,
            PathsSimulated = numberOfPaths
        };
    }
}

public class SimulationResultPayload
{
    public double ValueAtRisk { get; set; }
    public double ExpectedShortfall { get; set; }
    public double ConfidenceLevel { get; set; }
    public int PathsSimulated { get; set; }
}
