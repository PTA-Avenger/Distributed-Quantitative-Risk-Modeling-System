import { create } from 'zustand';

export interface Asset {
  id: string;
  name: string;
  weight: number;
  drift: number;
  volatility: number;
  initialPrice: number;
}

interface SimulationState {
  numberOfPaths: number;
  timeHorizonYears: number;
  timeSteps: number;
  portfolioSize: number;
  initialPortfolioValue: number;
  assets: Asset[];
  correlationMatrix: number[][]; // Hardcoded covariance/correlation scope
  
  setAssets: (assets: Asset[]) => void;
  setAssetsAndMatrix: (assets: Asset[], matrix: number[][]) => void;
  addAsset: () => void;
  removeAsset: (id: string) => void;
  setAssetWeight: (id: string, weight: number) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  setSimulationParam: (key: keyof Omit<SimulationState, 'assets' | 'correlationMatrix' | 'setAssetWeight' | 'updateAsset' | 'setSimulationParam' | 'setAssets' | 'addAsset' | 'removeAsset'>, value: number) => void;
  
  // For the active simulation
  activeSimId: string | null;
  setActiveSimId: (id: string | null) => void;
  
  isSimulating: boolean;
  setIsSimulating: (loading: boolean) => void;
  
  resultsVaR: number;
  resultsCVaR: number;
  resultsDistribution: { bucket: string, freq: number }[];
  resultsExpectedPnl: number;
  resultsMaxLoss: number;
  resultsMaxGain: number;
  resultsStdDev: number;
  resultsSkewness: number;
  resultsKurtosis: number;
  setResults: (
    var95: number, 
    cvar95: number, 
    distribution: any[], 
    expectedPnl: number, 
    maxLoss: number, 
    maxGain: number, 
    stdDev: number, 
    skewness: number, 
    kurtosis: number
  ) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  numberOfPaths: 100000,
  timeHorizonYears: 1.0,
  timeSteps: 252, // Trading days
  portfolioSize: 3,
  initialPortfolioValue: 1000000,
  
  assets: [
    { id: '1', name: 'AAPL', weight: 0.4, drift: 0.08, volatility: 0.25, initialPrice: 150 },
    { id: '2', name: 'MSFT', weight: 0.4, drift: 0.07, volatility: 0.22, initialPrice: 310 },
    { id: '3', name: 'TSLA', weight: 0.2, drift: 0.12, volatility: 0.45, initialPrice: 180 },
  ],
  
  // Hardcoded correlation matrix per instructions
  // 1.0 along the diagonal
  correlationMatrix: [
    [1.00, 0.65, 0.35],
    [0.65, 1.00, 0.40],
    [0.35, 0.40, 1.00],
  ],

  setAssets: (newAssets) => set((state) => {
    // Automatically rebuild a dummy correlation matrix based on n assets
    const n = newAssets.length;
    const newMatrix = Array.from({ length: n }, (_, i) => 
      Array.from({ length: n }, (_, j) => (i === j ? 1.0 : 0.0))
    );
    return { assets: newAssets, correlationMatrix: newMatrix };
  }),

  setAssetsAndMatrix: (newAssets, newMatrix) => set({
    assets: newAssets,
    correlationMatrix: newMatrix
  }),

  addAsset: () => set((state) => {
    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'NEW',
      weight: 0.0,
      drift: 0.0,
      volatility: 0.1,
      initialPrice: 100
    };
    const newAssets = [...state.assets, newAsset];
    const n = newAssets.length;
    const newMatrix = Array.from({ length: n }, (_, i) => 
      Array.from({ length: n }, (_, j) => (i === j ? 1.0 : 0.0))
    );
    return { assets: newAssets, correlationMatrix: newMatrix };
  }),

  removeAsset: (id) => set((state) => {
    const newAssets = state.assets.filter(a => a.id !== id);
    const n = newAssets.length;
    const newMatrix = Array.from({ length: n }, (_, i) => 
      Array.from({ length: n }, (_, j) => (i === j ? 1.0 : 0.0))
    );
    return { assets: newAssets, correlationMatrix: newMatrix };
  }),


  setAssetWeight: (id, weight) => set((state) => ({
    assets: state.assets.map(a => a.id === id ? { ...a, weight } : a)
  })),

  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  setSimulationParam: (key, value) => set({ [key]: value }),
  
  activeSimId: null,
  setActiveSimId: (id) => set({ activeSimId: id }),
  
  isSimulating: false,
  setIsSimulating: (loading) => set({ isSimulating: loading }),
  
  resultsVaR: 0,
  resultsCVaR: 0,
  resultsDistribution: [],
  resultsExpectedPnl: 0,
  resultsMaxLoss: 0,
  resultsMaxGain: 0,
  resultsStdDev: 0,
  resultsSkewness: 0,
  resultsKurtosis: 0,
  setResults: (var95, cvar95, distribution, expectedPnl, maxLoss, maxGain, stdDev, skewness, kurtosis) => set({ 
    resultsVaR: var95, 
    resultsCVaR: cvar95, 
    resultsDistribution: distribution,
    resultsExpectedPnl: expectedPnl,
    resultsMaxLoss: maxLoss,
    resultsMaxGain: maxGain,
    resultsStdDev: stdDev,
    resultsSkewness: skewness,
    resultsKurtosis: kurtosis
  }),
}));
