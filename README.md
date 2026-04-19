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

## How to Run Locally

To demonstrate the distributed nature of the system, you can run multiple instances of the worker and one instance of the coordinator.

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

> **Note on Netlify Deployment**
> 
> Netlify is an excellent platform for deploying frontend applications (like a React or Vue dashboard that consumes our GraphQL API). However, Netlify natively hosts static sites and serverless functions (like AWS Lambda typically running Node.js or Go). 
> 
> Because this backend is built with **C# .NET 8.0** and relies on **gRPC Server Streams** (which require persistent HTTP/2 connections), it cannot be hosted directly on Netlify. 
> 
> **Recommended Backend Hosting Alternatives:**
> - **Azure Container Apps** or **Google Cloud Run**: Ideal for containerized ASP.NET Core gRPC microservices.
> - **Fly.io** or **Render**: Excellent for running Docker containers that require persistent networking.
> 
> You can deploy a frontend dashboard on Netlify that makes traditional HTTP GraphQL calls to the Coordinator hosted on one of the above platforms!
