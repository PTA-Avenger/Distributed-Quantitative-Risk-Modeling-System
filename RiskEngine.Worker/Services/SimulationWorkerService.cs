using Grpc.Core;
using MathNet.Numerics.Distributions;
using MathNet.Numerics.LinearAlgebra;
using MathNet.Numerics.LinearAlgebra.Double;
using RiskEngine.Protos;

namespace RiskEngine.Worker.Services;

public class SimulationWorkerService : RiskSimulationService.RiskSimulationServiceBase
{
    private readonly ILogger<SimulationWorkerService> _logger;

    public SimulationWorkerService(ILogger<SimulationWorkerService> logger)
    {
        _logger = logger;
    }

    public override Task<SimulationResponse> ExecuteSimulation(SimulationRequest request, ServerCallContext context)
    {
        _logger.LogInformation("Worker received order to simulate {Paths} paths", request.NumberOfPaths);

        double dt = request.TimeHorizonYears / request.TimeSteps;
        int numAssets = request.PortfolioSize;

        // Unpack matrix and vectors
        var lMatrix = Matrix<double>.Build.DenseOfRowMajor(numAssets, numAssets, request.CholeskyMatrix.ToArray());
        var drifts = Vector<double>.Build.DenseOfEnumerable(request.Drifts);
        var volatilities = Vector<double>.Build.DenseOfEnumerable(request.Volatilities);
        var initialPrices = Vector<double>.Build.DenseOfEnumerable(request.InitialPrices);
        var weights = Vector<double>.Build.DenseOfEnumerable(request.Weights);

        double[] pnlArray = new double[request.NumberOfPaths];

        // Parallel processing of Monte Carlo paths
        Parallel.For(0, request.NumberOfPaths, i =>
        {
            var prices = initialPrices.Clone();
            
            // Random number generator per thread
            var normalDist = new Normal(0.0, 1.0, new Random(Thread.CurrentThread.ManagedThreadId + i));

            for (int t = 0; t < request.TimeSteps; t++)
            {
                // Generate uncorrelated randoms (Z)
                var zUncorrelated = Vector<double>.Build.Dense(numAssets, _ => normalDist.Sample());
                
                // Correlate using Cholesky (W = L * Z)
                var zCorrelated = lMatrix * zUncorrelated;

                for (int a = 0; a < numAssets; a++)
                {
                    // Geometric Brownian Motion step
                    double driftTerm = (drifts[a] - 0.5 * Math.Pow(volatilities[a], 2)) * dt;
                    double shockTerm = volatilities[a] * Math.Sqrt(dt) * zCorrelated[a];
                    
                    prices[a] = prices[a] * Math.Exp(driftTerm + shockTerm);
                }
            }

            // Calculate final portfolio value
            double finalPortfolioValue = 0;
            for (int a = 0; a < numAssets; a++)
            {
                double finalAssetWeightValue = weights[a] * request.InitialPortfolioValue * (prices[a] / initialPrices[a]);
                finalPortfolioValue += finalAssetWeightValue;
            }

            // P&L is final value minus initial value
            pnlArray[i] = finalPortfolioValue - request.InitialPortfolioValue;
        });

        var response = new SimulationResponse();
        response.ProfitAndLoss.AddRange(pnlArray);

        _logger.LogInformation("Worker completed {Paths} paths", request.NumberOfPaths);
        return Task.FromResult(response);
    }

    public override Task<PingResponse> Ping(PingRequest request, ServerCallContext context)
    {
        return Task.FromResult(new PingResponse 
        {
            Status = "Idle",
            Utilization = 0
        });
    }
}
