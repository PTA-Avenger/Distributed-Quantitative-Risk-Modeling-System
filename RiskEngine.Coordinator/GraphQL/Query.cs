using RiskEngine.Coordinator.Services;
using RiskEngine.Protos;

namespace RiskEngine.Coordinator.GraphQL;

public class Query
{
    public async Task<SimulationResultPayload> ExecuteSimulation(
        [Service] SimulationOrchestrator orchestrator,
        SimulationRequestInput request,
        double confidenceLevel = 0.95)
    {
        int n = request.Assets.Count;
        
        var rpcRequest = new SimulationRequest
        {
            NumberOfPaths = request.Paths,
            TimeHorizonYears = request.Horizon,
            TimeSteps = request.Steps,
            PortfolioSize = n,
            InitialPortfolioValue = request.InitialPortfolioValue,
        };

        rpcRequest.InitialPrices.AddRange(request.Assets.Select(a => a.InitialPrice));
        rpcRequest.Weights.AddRange(request.Assets.Select(a => a.Weight));
        rpcRequest.Drifts.AddRange(request.Assets.Select(a => a.Drift));
        rpcRequest.Volatilities.AddRange(request.Assets.Select(a => a.Volatility));

        // Execute Cholesky Factorization on C# side (O(N^3))
        double[,] lower = new double[n, n];
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j <= i; j++)
            {
                double sum = 0;
                if (j == i)
                {
                    for (int k = 0; k < j; k++) sum += Math.Pow(lower[j, k], 2);
                    lower[j, j] = Math.Sqrt(Math.Max(0.0001, request.CorrelationMatrix[j][j] - sum));
                }
                else
                {
                    for (int k = 0; k < j; k++) sum += (lower[i, k] * lower[j, k]);
                    lower[i, j] = (request.CorrelationMatrix[i][j] - sum) / lower[j, j];
                }
            }
        }

        for(int i = 0; i < n; i++) {
            for(int j = 0; j < n; j++) {
                rpcRequest.CholeskyMatrix.Add(lower[i, j]);
            }
        }

        var metrics = await orchestrator.RunDistributedSimulationAsync(rpcRequest, confidenceLevel);

        return new SimulationResultPayload
        {
            Var95 = metrics.ValueAtRisk,
            Cvar95 = metrics.ExpectedShortfall,
            PnlDistribution = metrics.PnlDistribution
        };
    }
}

public class SimulationRequestInput
{
    public int Paths { get; set; } = 100000;
    public double Horizon { get; set; } = 1.0;
    public int Steps { get; set; } = 252;
    public double InitialPortfolioValue { get; set; } = 1000000;
    public List<AssetInput> Assets { get; set; } = new();
    public List<List<double>> CorrelationMatrix { get; set; } = new();
}

public class AssetInput
{
    public double Weight { get; set; }
    public double Drift { get; set; }
    public double Volatility { get; set; }
    public double InitialPrice { get; set; }
}

public class SimulationResultPayload
{
    public double Var95 { get; set; }
    public double Cvar95 { get; set; }
    public List<DistributionBucket> PnlDistribution { get; set; } = new();
}
