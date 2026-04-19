namespace RiskEngine.Coordinator.Services;

public class RiskMetricsCalculator
{
    public RiskMetrics CalculateMetrics(double[] pnlArray, double confidenceLevel = 0.99)
    {
        if (pnlArray == null || pnlArray.Length == 0)
            return new RiskMetrics { ValueAtRisk = 0, ExpectedShortfall = 0, PnlDistribution = new List<DistributionBucket>() };

        // Sort ascending (losses are negative and will be at the start)
        Array.Sort(pnlArray);

        // Find the index for VaR (e.g., 99% confidence means bottom 1% of the sorted array)
        int varIndex = (int)Math.Floor(pnlArray.Length * (1 - confidenceLevel));
        
        // Ensure index is within bounds
        varIndex = Math.Max(0, Math.Min(varIndex, pnlArray.Length - 1));

        double valueAtRisk = pnlArray[varIndex];

        // Expected shortfall: average of all losses exceeding the VaR limit
        double sumExceeding = 0;
        for (int i = 0; i <= varIndex; i++)
        {
            sumExceeding += pnlArray[i];
        }
        
        double expectedShortfall = varIndex > 0 ? sumExceeding / (varIndex + 1) : valueAtRisk;

        var buckets = new List<DistributionBucket>();
        int numBuckets = 50;
        double minPnl = pnlArray[0];
        double maxPnl = pnlArray[pnlArray.Length - 1];
        double step = maxPnl > minPnl ? (maxPnl - minPnl) / numBuckets : 1;
    
        int currentBucket = 0;
        double currentBucketMax = minPnl + step;
        int count = 0;
    
        for (int i = 0; i < pnlArray.Length; i++)
        {
            if (pnlArray[i] <= currentBucketMax || currentBucket == numBuckets - 1)
            {
                count++;
            }
            else
            {
                buckets.Add(new DistributionBucket 
                { 
                    Bucket = Math.Floor(currentBucketMax - (step / 2)).ToString("N0"), 
                    Freq = count 
                });
                currentBucket++;
                currentBucketMax = minPnl + (currentBucket + 1) * step;
                count = 1;
                
                // Fast forward empty buckets
                while (pnlArray[i] > currentBucketMax && currentBucket < numBuckets - 1)
                {
                   buckets.Add(new DistributionBucket 
                   { 
                       Bucket = Math.Floor(currentBucketMax - (step / 2)).ToString("N0"), 
                       Freq = 0 
                   });
                   currentBucket++;
                   currentBucketMax = minPnl + (currentBucket + 1) * step;
                }
            }
        }
        
        buckets.Add(new DistributionBucket 
        { 
            Bucket = Math.Floor(currentBucketMax - (step / 2)).ToString("N0"), 
            Freq = count 
        });

        return new RiskMetrics
        {
            ValueAtRisk = valueAtRisk,
            ExpectedShortfall = expectedShortfall,
            PnlDistribution = buckets
        };
    }
}

public class DistributionBucket
{
    public string Bucket { get; set; } = string.Empty;
    public int Freq { get; set; }
}

public class RiskMetrics
{
    public double ValueAtRisk { get; set; }
    public double ExpectedShortfall { get; set; }
    public List<DistributionBucket> PnlDistribution { get; set; } = new();
}
