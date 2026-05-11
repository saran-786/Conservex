export interface ElectricityMonth {
  month: string;
  year: number;
  units: number;
}

export interface ElectricityData {
  history: ElectricityMonth[];
  pricePerUnit: number;
}

export interface LPGData {
  lastRefill: string;
  usageLevel: 'Low' | 'Medium' | 'High';
}

export interface HouseholdSettings {
  familyMembers: number;
}

export interface AppData {
  electricity: ElectricityData;
  lpg: LPGData;
  settings: HouseholdSettings;
}

export type Page = 'dashboard' | 'electricity' | 'lpg' | 'insights';
