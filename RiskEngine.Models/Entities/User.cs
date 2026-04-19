namespace RiskEngine.Models.Entities;

public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    public ICollection<SimulationHistory> Simulations { get; set; } = new List<SimulationHistory>();
}
