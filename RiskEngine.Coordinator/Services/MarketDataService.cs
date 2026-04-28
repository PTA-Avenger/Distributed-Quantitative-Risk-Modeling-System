using System.Globalization;
using System.Net.Http;
using System.Text.Json;

namespace RiskEngine.Coordinator.Services;

public class MarketDataPayload
{
    public List<MarketAsset> Assets { get; set; } = new();
    public List<List<double>> CorrelationMatrix { get; set; } = new();
}

public class MarketAsset
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Weight { get; set; }
    public double Drift { get; set; }
    public double Volatility { get; set; }
    public double InitialPrice { get; set; }
}

public class MarketDataService
{
    private readonly HttpClient _httpClient;

    public MarketDataService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<MarketDataPayload> FetchMarketDataAsync(List<string> tickers)
    {
        var endDate = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        // 2 years of data
        var startDate = DateTimeOffset.UtcNow.AddYears(-2).ToUnixTimeSeconds();

        var assetReturns = new Dictionary<string, List<double>>();
        var assets = new List<MarketAsset>();

        foreach (var ticker in tickers)
        {
            string url = $"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=2y";
            
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
                throw new Exception($"Failed to fetch data for {ticker}. Check if the symbol is valid.");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            
            var result = doc.RootElement.GetProperty("chart").GetProperty("result")[0];
            var indicators = result.GetProperty("indicators").GetProperty("quote")[0];
            
            // Extract the "close" array
            var closeArray = indicators.GetProperty("close");
            var prices = new List<double>();
            
            foreach (var closePrice in closeArray.EnumerateArray())
            {
                if (closePrice.ValueKind == JsonValueKind.Number)
                {
                    prices.Add(closePrice.GetDouble());
                }
            }

            if (prices.Count < 2) continue;

            var dailyReturns = new List<double>();
            for (int i = 1; i < prices.Count; i++)
            {
                dailyReturns.Add(Math.Log(prices[i] / prices[i - 1]));
            }

            assetReturns[ticker] = dailyReturns;

            double meanReturn = dailyReturns.Average();
            double variance = dailyReturns.Select(r => Math.Pow(r - meanReturn, 2)).Sum() / (dailyReturns.Count - 1);
            double dailyVol = Math.Sqrt(variance);

            double annualizedDrift = meanReturn * 252;
            double annualizedVol = dailyVol * Math.Sqrt(252);

            assets.Add(new MarketAsset
            {
                Id = ticker,
                Name = ticker,
                Weight = 1.0 / tickers.Count, // Equal weight by default
                Drift = annualizedDrift,
                Volatility = annualizedVol,
                InitialPrice = prices.Last()
            });
        }

        // Align arrays for correlation matrix (smallest length)
        int minLength = assetReturns.Values.Min(v => v.Count);
        foreach(var key in assetReturns.Keys)
        {
            assetReturns[key] = assetReturns[key].Skip(assetReturns[key].Count - minLength).ToList();
        }

        int n = assets.Count;
        var correlationMatrix = new List<List<double>>();
        
        for (int i = 0; i < n; i++)
        {
            var row = new List<double>();
            for (int j = 0; j < n; j++)
            {
                if (i == j)
                {
                    row.Add(1.0);
                }
                else
                {
                    var x = assetReturns[assets[i].Name];
                    var y = assetReturns[assets[j].Name];
                    
                    double meanX = x.Average();
                    double meanY = y.Average();
                    
                    double covXY = x.Zip(y, (a, b) => (a - meanX) * (b - meanY)).Sum();
                    double varX = x.Sum(a => Math.Pow(a - meanX, 2));
                    double varY = y.Sum(b => Math.Pow(b - meanY, 2));
                    
                    double correlation = covXY / Math.Sqrt(varX * varY);
                    row.Add(correlation);
                }
            }
            correlationMatrix.Add(row);
        }

        return new MarketDataPayload
        {
            Assets = assets,
            CorrelationMatrix = correlationMatrix
        };
    }
}
