namespace RiskEngine.Models.Entities;

public class SimulationHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    
    public int? PortfolioId { get; set; }
    public Portfolio? Portfolio { get; set; }

    public int Paths { get; set; }
    public double HorizonYears { get; set; }
    
    public double VaR95 { get; set; }
    public double CVaR95 { get; set; }
    public double ExpectedPnL { get; set; }
    
    public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
}
