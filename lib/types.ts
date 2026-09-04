// ─── Shared TypeScript Types ──────────────────────────────────────────────────

export type BudgetTier = 'budget' | 'mid' | 'luxury';
export type WardrobeCategory = 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear' | 'dress' | 'other';
export type PollChoice = 'A' | 'B';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  gender_preference: string | null;
  avg_style_score: number | null;
  budget_tier: BudgetTier | null;
  created_at: string;
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  image_url: string;
  category: WardrobeCategory;
  color: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface OutfitAnalysis {
  id: string;
  user_id: string;
  image_url: string;
  style_score: number;
  color_feedback: string | null;
  fit_feedback: string | null;
  accessory_feedback: string | null;
  suggestion: string | null;
  created_at: string;
}

export interface CommunityPoll {
  id: string;
  user_id: string;
  question: string;
  image_a_url: string;
  image_b_url: string;
  votes_a: number;
  votes_b: number;
  occasion: string | null;
  created_at: string;
  // Joined from profiles
  profiles?: Pick<Profile, 'full_name' | 'avatar_url'>;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  choice: PollChoice;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface DailyOutfitResponse {
  outfit: string[];
  rationale: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  weatherIcon: string;
  location: string;
}

export interface OutfitAnalysisResult {
  score: number;
  colorFeedback: string;
  fitFeedback: string;
  accessoryFeedback: string;
  suggestion: string;
  imageUrl: string;
}
