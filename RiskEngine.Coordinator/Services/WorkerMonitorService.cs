using Grpc.Net.Client;
using HotChocolate.Subscriptions;
using RiskEngine.Protos;

namespace RiskEngine.Coordinator.Services;

public class WorkerStatusMessage
{
    public string WorkerId { get; set; } = string.Empty;
    public string Status { get; set; } = "offline";
    public double Utilization { get; set; }
}

public class WorkerMonitorService : BackgroundService
{
    private readonly IConfiguration _configuration;
    private readonly ITopicEventSender _eventSender;
    private readonly ILogger<WorkerMonitorService> _logger;

    public WorkerMonitorService(IConfiguration configuration, ITopicEventSender eventSender, ILogger<WorkerMonitorService> logger)
    {
        _configuration = configuration;
        _eventSender = eventSender;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var workerUrls = _configuration.GetSection("WorkerUrls").Get<string[]>() ?? new[] { "http://localhost:5001" };
            
            for (int i = 0; i < workerUrls.Length; i++)
            {
                var url = workerUrls[i];
                var workerId = (i + 1).ToString("D2"); // "01", "02", etc.
                
                try
                {
                    using var channel = GrpcChannel.ForAddress(url);
                    var client = new RiskSimulationService.RiskSimulationServiceClient(channel);
                    
                    var response = await client.PingAsync(new PingRequest(), deadline: DateTime.UtcNow.AddSeconds(1), cancellationToken: stoppingToken);
                    
                    await _eventSender.SendAsync("workerStatusStream", new WorkerStatusMessage
                    {
                        WorkerId = workerId,
                        Status = response.Status.ToLower(),
                        Utilization = response.Utilization
                    }, stoppingToken);
                }
                catch (Exception)
                {
                    await _eventSender.SendAsync("workerStatusStream", new WorkerStatusMessage
                    {
                        WorkerId = workerId,
                        Status = "offline",
                        Utilization = 0
                    }, stoppingToken);
                }
            }

            await Task.Delay(2000, stoppingToken);
        }
    }
}
