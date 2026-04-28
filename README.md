# Distributed Quantitative Risk Modeling System

A high-performance, distributed Monte Carlo simulation engine built with C# (.NET 8.0) and gRPC. The system calculates the risk profile of an investment portfolio by simulating thousands of price paths using Geometric Brownian Motion (GBM) and determining the **Value at Risk (VaR)** and **Expected Shortfall (ES)**.

## Architecture

This project perfectly demonstrates a high-performance distributed systems architecture:

- **RiskEngine.Protos**: Shared gRPC protobuf contracts (`risk_simulation.proto`) that define the communication between nodes.
- **RiskEngine.Worker (gRPC Server)**: The computational node. It receives a batch of Monte Carlo paths, performs heavy matrix multiplication and correlated random number generation using `MathNet.Numerics`, and returns an array of profit/loss (P&L) values.
- **RiskEngine.Coordinator (gRPC Client & GraphQL Server)**: The orchestrator node. It distributes the simulation workload across multiple worker nodes, aggregates the returned massive P&L arrays, and calculates the VaR and Expected Shortfall. It then exposes these metrics via a flexible **GraphQL API** (using HotChocolate) for external dashboards.

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- Visual Studio 2022 or VS Code
- PostgreSQL running locally on `localhost:5432` (or Docker Compose with the included `postgres_db` service)

## How to Run Locally

To demonstrate the distributed nature of the system, you can run multiple instances of the worker and one instance of the coordinator.

### Start PostgreSQL first

If you have Docker installed, run:
```powershell
docker compose up -d postgres_db
```

If you prefer a native installation, make sure PostgreSQL is running and accepting connections on `localhost:5432` with credentials:
- `Username`: `postgres`
- `Password`: `postgres`
- `Database`: `RiskEngine`


1. **Start Worker 1:**
   Open a terminal and run:
   ```bash
   dotnet run --project RiskEngine.Worker/RiskEngine.Worker.csproj --urls "https://localhost:7001;http://localhost:5001"
   ```

2. **Start Worker 2 (Optional - to test load balancing):**
   Open a second terminal and run:
   ```bash
   dotnet run --project RiskEngine.Worker/RiskEngine.Worker.csproj --urls "https://localhost:7002;http://localhost:5002"
   ```

3. **Start the Coordinator:**
   Open a third terminal and run:
   ```bash
   dotnet run --project RiskEngine.Coordinator/RiskEngine.Coordinator.csproj --urls "http://localhost:5100"
   ```

4. **Execute a GraphQL Query:**
   Navigate your browser to `http://localhost:5100/graphql`. In the Banana Cake Pop IDE, run the following query:
   ```graphql
   query {
     portfolioRisk(
       numberOfPaths: 100000, 
       confidenceLevel: 0.99, 
       timeHorizonYears: 1.0
     ) {
       valueAtRisk
       expectedShortfall
       confidenceLevel
       pathsSimulated
     }
   }
   ```

## Deployment Considerations

### Expose the Coordinator using Cloudflare Tunnel

For a stable public endpoint without opening router ports, Cloudflare Tunnel is a great fit. It lets you expose the local Coordinator service securely through Cloudflare's network, while the Worker nodes remain local.

1. Run the Coordinator locally:
   ```bash
   dotnet run --project RiskEngine.Coordinator/RiskEngine.Coordinator.csproj --urls "http://localhost:5100"
   ```
2. Expose it through Cloudflare Tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:5100
   ```
3. Use the generated public URL to reach the GraphQL API, for example:
   ```text
   https://<random-subdomain>.trycloudflare.com/graphql
   ```

If you want a permanent public hostname, create and run a named tunnel with a Cloudflare account and a local config file.

**Why this works well for this project**
- The Coordinator stays local and continues to call local Worker instances on `localhost`.
- No router port forwarding is required.
- Cloudflare provides TLS termination, DDoS protection, and a public endpoint for dashboards or remote clients.

### Recommended backend hosting alternatives

This backend is built with **C# .NET 8.0** and relies on long-lived HTTP connections, so it is not a direct fit for Netlify’s static hosting model.

Recommended hosting options for the backend:
- **Azure Container Apps** or **Google Cloud Run**: Ideal for containerized ASP.NET Core microservices.
- **Fly.io** or **Render**: Good for Docker containers with persistent networking.

You can still deploy the frontend on Netlify while using Cloudflare Tunnel or another backend host for the Coordinator.
