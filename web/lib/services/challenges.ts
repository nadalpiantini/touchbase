// ============================================================
// TouchBase Academy - Challenge Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { Challenge, ChallengeParticipant, ChallengeType } from "@/lib/types/challenge";

/**
 * Create a new challenge
 */
export async function createChallenge(
  supabase: SupabaseClient,
  teacherId: string,
  data: {
    org_id: string;
    class_id?: string;
    title: string;
    description?: string;
    challenge_type: ChallengeType;
    target_value: number;
    reward_xp?: number;
    reward_badge_id?: string;
    end_date?: string;
  }
): Promise<Challenge> {
  const { data: challenge, error } = await supabase
    .from("touchbase_challenges")
    .insert({
      teacher_id: teacherId,
      org_id: data.org_id,
      class_id: data.class_id,
      title: data.title,
      description: data.description,
      challenge_type: data.challenge_type,
      target_value: data.target_value,
      reward_xp: data.reward_xp || 0,
      reward_badge_id: data.reward_badge_id,
      end_date: data.end_date,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return challenge as Challenge;
}

/**
 * Get challenges for an organization
 */
export async function getChallenges(
  supabase: SupabaseClient,
  orgId: string,
  filters?: {
    classId?: string;
    activeOnly?: boolean;
  }
): Promise<Challenge[]> {
  let query = supabase
    .from("touchbase_challenges")
    .select("*")
    .eq("org_id", orgId);

  if (filters?.classId) {
    query = query.eq("class_id", filters.classId);
  }

  if (filters?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Challenge[];
}

/**
 * Join a challenge
 */
export async function joinChallenge(
  supabase: SupabaseClient,
  challengeId: string
): Promise<ChallengeParticipant> {
  const { data, error } = await supabase.rpc("touchbase_join_challenge", {
    p_challenge_id: challengeId,
  });

  if (error) throw error;
  return data as ChallengeParticipant;
}

/**
 * Get user's challenge participations
 */
export async function getUserChallenges(
  supabase: SupabaseClient,
  userId: string,
  orgId: string
): Promise<ChallengeParticipant[]> {
  const { data, error } = await supabase
    .from("touchbase_challenge_participants")
    .select(`
      *,
      challenge:touchbase_challenges (*)
    `)
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .order("joined_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ChallengeParticipant[];
}

/**
 * Get challenge participants
 */
export async function getChallengeParticipants(
  supabase: SupabaseClient,
  challengeId: string
): Promise<ChallengeParticipant[]> {
  const { data, error } = await supabase
    .from("touchbase_challenge_participants")
    .select(`
      *,
      user_profile:touchbase_profiles(id, full_name, email)
    `)
    .eq("challenge_id", challengeId)
    .order("current_progress", { ascending: false })
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return (data || []) as ChallengeParticipant[];
}

/**
 * Update challenge progress (called automatically by system)
 */
export async function updateChallengeProgress(
  supabase: SupabaseClient,
  challengeId: string,
  userId: string,
  progressDelta: number
): Promise<ChallengeParticipant> {
  const { data, error } = await supabase.rpc("touchbase_update_challenge_progress", {
    p_challenge_id: challengeId,
    p_user_id: userId,
    p_progress_delta: progressDelta,
  });

  if (error) throw error;
  return data as ChallengeParticipant;
}

