namespace RiskEngine.Models.Entities;

public class Portfolio
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    public required string Name { get; set; }
    public string AssetsJson { get; set; } = "[]"; // Serialized frontend assets
    public string CorrelationMatrixJson { get; set; } = "[]"; // Serialized matrix

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
