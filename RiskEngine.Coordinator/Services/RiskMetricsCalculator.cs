namespace RiskEngine.Coordinator.Services;

public class RiskMetricsCalculator
{
    public RiskMetrics CalculateMetrics(double[] pnlArray, double confidenceLevel = 0.99)
    {
        if (pnlArray == null || pnlArray.Length == 0)
            return new RiskMetrics { ValueAtRisk = 0, ExpectedShortfall = 0 };

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

        return new RiskMetrics
        {
            ValueAtRisk = valueAtRisk,
            ExpectedShortfall = expectedShortfall
        };
    }
}

public class RiskMetrics
{
    public double ValueAtRisk { get; set; }
    public double ExpectedShortfall { get; set; }
}
