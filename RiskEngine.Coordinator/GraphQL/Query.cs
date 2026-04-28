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
        try
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

            // Validate correlation matrix
            if (request.CorrelationMatrix == null || request.CorrelationMatrix.Count != n)
            {
                throw new Exception($"CorrelationMatrix is missing or size {request.CorrelationMatrix?.Count} does not match Assets size {n}.");
            }

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
                PnlDistribution = metrics.PnlDistribution,
                ExpectedPnl = metrics.ExpectedPnl,
                MaxLoss = metrics.MaxLoss,
                MaxGain = metrics.MaxGain,
                StandardDeviation = metrics.StandardDeviation,
                Skewness = metrics.Skewness,
                Kurtosis = metrics.Kurtosis
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine("CRITICAL SIMULATION ERROR:");
            Console.WriteLine(ex.ToString());
            throw new GraphQLException(new Error(ex.Message));
        }
    }

    public async Task<MarketDataPayload> FetchMarketData(
        [Service] MarketDataService marketDataService,
        List<string> tickers)
    {
        return await marketDataService.FetchMarketDataAsync(tickers);
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
    public double ExpectedPnl { get; set; }
    public double MaxLoss { get; set; }
    public double MaxGain { get; set; }
    public double StandardDeviation { get; set; }
    public double Skewness { get; set; }
    public double Kurtosis { get; set; }
}
