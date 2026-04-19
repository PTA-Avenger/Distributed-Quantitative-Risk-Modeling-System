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
  
  setAssetWeight: (id: string, weight: number) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  setSimulationParam: (key: keyof Omit<SimulationState, 'assets' | 'correlationMatrix' | 'setAssetWeight' | 'updateAsset' | 'setSimulationParam'>, value: number) => void;
  
  // For the active simulation
  activeSimId: string | null;
  setActiveSimId: (id: string | null) => void;
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

  setAssetWeight: (id, weight) => set((state) => ({
    assets: state.assets.map(a => a.id === id ? { ...a, weight } : a)
  })),

  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  setSimulationParam: (key, value) => set({ [key]: value }),
  
  activeSimId: null,
  setActiveSimId: (id) => set({ activeSimId: id }),
}));
