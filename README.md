# Distributed Quantitative Risk Modeling System

A distributed .NET-based system for performing quantitative risk analysis on investment portfolios using Monte Carlo simulations. The system uses GraphQL for client queries and gRPC for high-performance inter-service communication.

## Overview

This system enables financial institutions and portfolio managers to:
- Execute Monte Carlo simulations for portfolio risk assessment
- Calculate risk metrics and P&L distributions
- Orchestrate complex simulations across distributed workers
- Query results through a GraphQL interface

### Key Features

- **Distributed Architecture**: Coordinator-worker pattern for scalable simulations
- **GraphQL API**: Flexible querying interface through HotChocolate
- **gRPC Services**: High-performance inter-service communication
- **Monte Carlo Simulations**: Correlated asset price path generation with Cholesky decomposition
- **Portfolio Analysis**: Real-time P&L calculations and risk metrics

## Architecture

### Components

#### RiskEngine.Coordinator
The main orchestration service that:
- Exposes a GraphQL API for clients
- Manages simulation requests and orchestration
- Calculates risk metrics from simulation results
- Routes requests to worker nodes via gRPC

**Key Services:**
- `SimulationOrchestrator`: Coordinates simulation execution across workers
- `RiskMetricsCalculator`: Computes risk metrics (VaR, CVaR, etc.) from simulation paths

**Endpoint:** `/graphql` (GraphQL playground and queries)

#### RiskEngine.Worker
A gRPC service that performs computational work:
- Executes Monte Carlo simulations
- Generates correlated asset price paths
- Calculates portfolio P&L distributions
- Returns simulation results to the coordinator

**Service:** `RiskSimulationService`

#### RiskEngine.Models
Shared data models and domain classes used across services

#### RiskEngine.Protos
Protocol Buffer definitions for gRPC service contracts:
- `RiskSimulationService`: Main simulation service definition
- `SimulationRequest`: Input parameters for Monte Carlo simulations
- `SimulationResponse`: Simulation results (P&L array)

## Prerequisites

- **.NET 10.0 SDK**: [Download](https://dotnet.microsoft.com/download)
- **Visual Studio Code** or **Visual Studio** (recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Distributed-Quantitative-Risk-Modeling-System
```

### 2. Build the Solution

```bash
dotnet build RiskEngine.slnx
```

### 3. Build Individual Projects

If you prefer to build projects separately:

```bash
# Build all projects
dotnet build

# Or build specific projects
dotnet build RiskEngine.Coordinator
dotnet build RiskEngine.Worker
```

### 4. Run the Services

**Terminal 1 - Start the Worker:**

```bash
cd RiskEngine.Worker
dotnet run
```

Expected output: Worker listening on `http://localhost:5000` (or configured port)

**Terminal 2 - Start the Coordinator:**

```bash
cd RiskEngine.Coordinator
dotnet run
```

Expected output: Coordinator running on `http://localhost:5001` (or configured port)

### 5. Access GraphQL API

Navigate to:
```
http://localhost:5001/graphql
```

## Configuration

### Coordinator Configuration

Edit `RiskEngine.Coordinator/appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Worker Configuration

Edit `RiskEngine.Worker/appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

## API Usage

### GraphQL Queries

Example GraphQL query (accessible at `/graphql`):

```graphql
query SimulatePortfolio {
  # Query definition will depend on your Query.cs implementation
}
```

### gRPC Service

The Worker exposes the `RiskSimulationService` with:

**RPC Methods:**
- `ExecuteSimulation(SimulationRequest): SimulationResponse`

**Request Parameters:**
- `number_of_paths`: Number of Monte Carlo simulation paths
- `time_horizon_years`: Time period for simulation (in years)
- `time_steps`: Number of discrete time steps
- `portfolio_size`: Number of assets in portfolio
- `cholesky_matrix`: Flattened Cholesky decomposition of correlation matrix
- `drifts`: Expected returns for each asset
- `volatilities`: Volatility for each asset
- `initial_prices`: Starting price for each asset
- `weights`: Portfolio weights for each asset
- `initial_portfolio_value`: Total initial portfolio value

**Response:**
- `pnl_array`: Array of portfolio P&L values (one per simulation path)

## Simulation Details

### Monte Carlo Method

The system uses Monte Carlo simulations to:
1. Generate correlated random asset price paths using Cholesky decomposition
2. Project portfolio values across time steps
3. Calculate final P&L for each path

### Key Inputs

- **Correlation Matrix**: Captures dependencies between assets
- **Drifts**: Expected annual returns per asset
- **Volatilities**: Annual volatility per asset
- **Weights**: Portfolio allocation proportions

### Output

- P&L distribution across all simulated paths
- Risk metrics derived from the distribution (VaR, CVaR, etc.)

## Project Structure

```
RiskEngine.slnx                          # Solution file
├── RiskEngine.Coordinator/              # GraphQL orchestration service
│   ├── Program.cs                       # Startup configuration
│   ├── GraphQL/
│   │   └── Query.cs                     # GraphQL query definitions
│   ├── Services/
│   │   ├── RiskMetricsCalculator.cs    # Risk metric calculations
│   │   └── SimulationOrchestrator.cs   # Simulation orchestration
│   ├── appsettings.json                 # Configuration
│   └── RiskEngine.Coordinator.csproj
├── RiskEngine.Worker/                   # gRPC worker service
│   ├── Program.cs                       # Startup configuration
│   ├── Services/
│   │   └── SimulationWorkerService.cs  # Worker implementation
│   ├── appsettings.json                 # Configuration
│   └── RiskEngine.Worker.csproj
├── RiskEngine.Protos/                   # Protocol Buffer definitions
│   ├── Protos/
│   │   └── risk_simulation.proto        # gRPC service definitions
│   └── RiskEngine.Protos.csproj
├── RiskEngine.Models/                   # Shared domain models
│   └── RiskEngine.Models.csproj
└── README.md                            # This file
```

## Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| .NET | 10.0 | Runtime framework |
| HotChocolate | 15.1.14 | GraphQL implementation |
| gRPC.NET | 2.76.0 | Distributed service communication |
| Protocol Buffers | 3.34.1 | Service contracts |

## Development Workflow

### Adding a New Risk Metric

1. Add calculation logic to `RiskMetricsCalculator.cs`
2. Expose via GraphQL in `Query.cs`
3. Deploy updated Coordinator

### Scaling Simulations

1. Deploy multiple Worker instances
2. Configure Load Balancer (e.g., nginx) in front of Workers
3. Update Coordinator with worker pool configuration

### Debugging

Enable logging in `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "RiskEngine": "Debug"
    }
  }
}
```

## Performance Considerations

- **Number of Paths**: More paths = higher accuracy but longer computation time
- **Time Steps**: More granularity requires more computation
- **Worker Count**: Scale horizontally by adding more workers
- **Correlation Matrix Size**: Cholesky decomposition complexity O(n²)

## Troubleshooting

### Worker Not Responding

- Ensure Worker is running and listening on the configured port
- Check network connectivity between Coordinator and Worker
- Verify gRPC channel configuration in appsettings

### GraphQL Query Errors

- Check Query.cs implementation
- Verify Worker has simulation results available
- Review application logs

### Simulation Accuracy Issues

- Verify Cholesky matrix is correctly computed
- Check that portfolio weights sum to 1.0
- Ensure volatilities and drifts are in correct units (annual)

## Contributing

1. Create a feature branch
2. Make changes to appropriate service
3. Test end-to-end with both Coordinator and Worker
4. Submit pull request

## License

[Add your license information here]

## Support

For issues or questions:
- Check the troubleshooting section above
- Review application logs in `bin/Debug/` or via structured logging
- Submit issues through [your issue tracking system]

## Future Enhancements

- [ ] Database persistence for simulation results
- [ ] Historical data integration
- [ ] Advanced risk metrics (Greeks, stress testing)
- [ ] Web UI dashboard
- [ ] Performance optimizations (SIMD, GPU acceleration)
- [ ] Distributed result aggregation

---

**Last Updated:** April 2026
