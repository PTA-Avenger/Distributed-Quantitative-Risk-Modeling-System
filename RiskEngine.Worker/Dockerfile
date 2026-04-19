FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY RiskEngine.slnx .
COPY RiskEngine.Worker/RiskEngine.Worker.csproj RiskEngine.Worker/
COPY RiskEngine.Models/RiskEngine.Models.csproj RiskEngine.Models/
COPY RiskEngine.Protos/RiskEngine.Protos.csproj RiskEngine.Protos/
COPY RiskEngine.Coordinator/RiskEngine.Coordinator.csproj RiskEngine.Coordinator/
RUN dotnet restore RiskEngine.Worker/RiskEngine.Worker.csproj

COPY . .
WORKDIR /src/RiskEngine.Worker
# Use /m:1 to restrict MSBuild to a single core, avoiding 512MB RAM limits on Render Free Tier
RUN dotnet publish -c Release -o /app/publish -p:UseAppHost=false /m:1

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "RiskEngine.Worker.dll"]
