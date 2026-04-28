using RiskEngine.Coordinator.Services;

namespace RiskEngine.Coordinator.GraphQL;

public class Subscription
{
    [Subscribe]
    [Topic("workerStatusStream")]
    public WorkerStatusMessage OnWorkerStatusChange([EventMessage] WorkerStatusMessage message)
    {
        return message;
    }
}
