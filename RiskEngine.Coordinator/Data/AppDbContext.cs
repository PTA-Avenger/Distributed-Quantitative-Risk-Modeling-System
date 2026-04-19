using Microsoft.EntityFrameworkCore;
using RiskEngine.Models.Entities;

namespace RiskEngine.Coordinator.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<SimulationHistory> Simulations => Set<SimulationHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
    }
}
