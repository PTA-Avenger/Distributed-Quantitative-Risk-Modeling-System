using Grpc.Net.Client;
using RiskEngine.Protos;

namespace RiskEngine.Coordinator.Services;

public class SimulationOrchestrator
{
    private readonly IConfiguration _configuration;
    private readonly RiskMetricsCalculator _calculator;

    public SimulationOrchestrator(IConfiguration configuration, RiskMetricsCalculator calculator)
    {
        _configuration = configuration;
        _calculator = calculator;
    }

    public async Task<RiskMetrics> RunDistributedSimulationAsync(SimulationRequest baseRequest, double confidenceLevel)
    {
        // Get worker URLs from configuration (e.g., appsettings.json)
        var workerUrls = _configuration.GetSection("WorkerUrls").Get<string[]>() ?? new[] { "https://localhost:7001" };

        int totalPaths = baseRequest.NumberOfPaths;
        int pathsPerWorker = totalPaths / workerUrls.Length;
        int remainingPaths = totalPaths % workerUrls.Length;

        var tasks = new List<Task<SimulationResponse>>();

        for (int i = 0; i < workerUrls.Length; i++)
        {
            int allocatedPaths = pathsPerWorker + (i == 0 ? remainingPaths : 0);
            if (allocatedPaths == 0) continue;

            string url = workerUrls[i];
            
            // Clone the request for this worker
            var workerRequest = baseRequest.Clone();
            workerRequest.NumberOfPaths = allocatedPaths;

            tasks.Add(CallWorkerAsync(url, workerRequest));
        }

        SimulationResponse[] responses = await Task.WhenAll(tasks);

        // Aggregate P&L arrays
        var aggregatedPnl = new List<double>(totalPaths);
        foreach (var response in responses)
        {
            aggregatedPnl.AddRange(response.ProfitAndLoss);
        }

        return _calculator.CalculateMetrics(aggregatedPnl.ToArray(), confidenceLevel);
    }

    private async Task<SimulationResponse> CallWorkerAsync(string url, SimulationRequest request)
    {
        using var channel = GrpcChannel.ForAddress(url);
        var client = new RiskSimulationService.RiskSimulationServiceClient(channel);
        
        return await client.ExecuteSimulationAsync(request);
    }
}
