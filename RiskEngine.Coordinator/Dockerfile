FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY RiskEngine.slnx .
COPY RiskEngine.Coordinator/RiskEngine.Coordinator.csproj RiskEngine.Coordinator/
COPY RiskEngine.Models/RiskEngine.Models.csproj RiskEngine.Models/
COPY RiskEngine.Protos/RiskEngine.Protos.csproj RiskEngine.Protos/
COPY RiskEngine.Worker/RiskEngine.Worker.csproj RiskEngine.Worker/
RUN dotnet restore RiskEngine.Coordinator/RiskEngine.Coordinator.csproj

COPY . .
WORKDIR /src/RiskEngine.Coordinator
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "RiskEngine.Coordinator.dll"]
