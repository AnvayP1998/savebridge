// ============================================================
// SavorBridge — Shared Type Definitions
// ============================================================

export interface WicItem {
  category: string;
  quantity: string;
  expiresAt: string;
  urgency: "low" | "medium" | "high";
  notes?: string;
}

export interface Child {
  age: number;
  name: string;
}

export interface Family {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  ethnicity: string;
  language: string;
  householdSize: number;
  children: Child[];
  monthlyIncome: number;
  rent: number;
  utilities: number;
  childcareCost: number;
  medicalExpenses: number;
  currentSnapBenefit: number;
  currentWicBenefit: number;
  wicItems: WicItem[];
  preferredStores: string[];
  notes: string;
  caseNumber: string;
  caseworkerId: string;
  lastUpdated: string;
}

export type ErrorSeverity = "critical" | "warning" | "info";

export interface ErrorFlag {
  id: string;
  type: string;
  title: string;
  explanation: string;
  suggestedAction: string;
  fieldAffected: string;
  benefitImpact: number;
  severity: ErrorSeverity;
  confidence: number;
  references?: string[];
}

export interface ShoppingStop {
  storeId: string;
  storeName: string;
  address: string;
  distance?: string;
  snapAccepted: boolean;
  wicAccepted: boolean;
  doubleUpEligible: boolean;
  doubleUpMatchMax: number;
  recommendedItems: string[];
  estimatedSavings: number;
  priority: number;
  notes?: string;
}

export interface Recipe {
  name: string;
  nameTranslated?: string;
  description: string;
  servings: number;
  ingredients: string[];
  usesWicItems: string[];
  culturalOrigin?: string;
  prepTimeMinutes: number;
  tags: string[];
}

export interface BenefitPlan {
  familyId: string;
  language: string;
  generatedAt: string;
  monthlySummary: {
    snapAmount: number;
    wicValue: number;
    doubleUpPotential: number;
    totalFoodBudget: number;
  };
  shoppingRoute: ShoppingStop[];
  wicPriorities: WicItem[];
  recipes: Recipe[];
  tips: string[];
  planNarrative: string;
}

export interface VoiceQARequest {
  query: string;
  language: string;
  familyId: string;
}

export interface VoiceQAResponse {
  answer: string;
  relatedStores?: string[];
  relatedItems?: string[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: "supermarket" | "bodega" | "farmers-market" | "mobile-market" | "food-bank";
  snapAccepted: boolean;
  wicAccepted: boolean;
  doubleUpEligible: boolean;
  doubleUpMatchMax: number;
  hours?: string;
  notes?: string;
}

export interface DailyMetric {
  date: string;
  familiesServed: number;
  errorsFound: number;
  benefitsRecovered: number;
}

export interface AgencyStats {
  totalFamiliesThisWeek: number;
  errorsCaughtThisWeek: number;
  dollarsRecoveredThisWeek: number;
  projectedAnnualSavings: number;
  dailyMetrics: DailyMetric[];
}
