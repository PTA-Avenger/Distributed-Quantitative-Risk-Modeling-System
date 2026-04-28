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

        // Calculate statistical moments
        double mean = pnlArray.Average();
        double maxLoss = pnlArray[0];
        double maxGain = pnlArray[pnlArray.Length - 1];
        
        double sumSq = 0;
        double sumCube = 0;
        double sumQuad = 0;
        
        foreach (var pnl in pnlArray)
        {
            double diff = pnl - mean;
            sumSq += Math.Pow(diff, 2);
            sumCube += Math.Pow(diff, 3);
            sumQuad += Math.Pow(diff, 4);
        }

        double stdDev = Math.Sqrt(sumSq / pnlArray.Length);
        double skewness = (pnlArray.Length > 0 && stdDev > 0) ? (sumCube / pnlArray.Length) / Math.Pow(stdDev, 3) : 0;
        double kurtosis = (pnlArray.Length > 0 && stdDev > 0) ? (sumQuad / pnlArray.Length) / Math.Pow(stdDev, 4) : 0;

        return new RiskMetrics
        {
            ValueAtRisk = valueAtRisk,
            ExpectedShortfall = expectedShortfall,
            PnlDistribution = buckets,
            ExpectedPnl = mean,
            MaxLoss = maxLoss,
            MaxGain = maxGain,
            StandardDeviation = stdDev,
            Skewness = skewness,
            Kurtosis = kurtosis
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
    public double ExpectedPnl { get; set; }
    public double MaxLoss { get; set; }
    public double MaxGain { get; set; }
    public double StandardDeviation { get; set; }
    public double Skewness { get; set; }
    public double Kurtosis { get; set; }
}
