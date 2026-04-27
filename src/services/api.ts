const BASE_URL = "https://maidan-iq-api-production.up.railway.app";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") p.append(k, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

/* ─── Response types (from live API sampling) ───────────────────────────── */

export interface VenueSummary {
  name: string;
  city: string;
  total_matches: number;
  avg_first_innings_score: number;
  chase_win_pct: number;
}

export interface VenueDetail extends VenueSummary {
  avg_second_innings_score: number;
  highest_score: number;
  lowest_score: number;
  avg_powerplay_score: number;
}

export interface TeamSummary {
  team_name: string;
  total_matches: number;
  total_wins: number;
  win_pct: number;
  seasons_played: number;
}

export interface TeamStrength {
  team_name: string;
  overall_win_pct: number;
  chase_win_pct: number;
  defend_win_pct: number;
  avg_first_innings_score: number;
  avg_powerplay_runs_batting: number;
  avg_death_economy_bowling: number;
}

export interface PlayerSummary {
  registry_id: string;
  name: string;
}

export interface PlayerDetail {
  registry_id: string;
  name: string;
  batting: {
    total_runs: number;
    total_balls: number;
    strike_rate: number;
    boundary_fours: number;
    boundary_sixes: number;
    boundary_pct: number;
    avg_runs_per_innings: number;
    powerplay_sr: number;
    death_sr: number;
    pressure_sr: number;
  };
  bowling: {
    total_wickets: number;
    total_balls_bowled: number;
    economy: number | null;
    powerplay_economy: number | null;
    death_economy: number | null;
    dot_ball_pct: number | null;
  };
}

export interface PlayerMatchup {
  balls_faced: number;
  runs: number;
  strike_rate: number;
  dismissals: number;
  dismissal_pct: number;
  boundary_pct: number;
}

export interface MatchSummary {
  id: string;
  date: string;
  team1: string;
  team2: string;
  venue: string;
  city: string;
  season: string;
  winner: string;
}

export interface OverEntry {
  over_number: number;
  runs_that_over: number;
  wickets_that_over: number;
  cumulative_score: number;
  cumulative_wickets: number;
  key_batter: string;
  key_bowler: string;
}

export interface Partnership {
  innings_number: number;
  batter1: string;
  batter2: string;
  runs: number;
  balls: number;
  wicket_fell: boolean;
}

export interface Wicket {
  innings_number: number;
  over_number: number;
  ball_number: number;
  wicket_player_out: string;
  wicket_kind: string;
  score_at_fall: number;
}

export interface MatchStory {
  match_id: string;
  innings_timeline: Record<string, OverEntry[]>;
  partnerships: Partnership[];
  wickets: Wicket[];
}

export interface TeamMatchup {
  total_balls: number;
  total_runs: number;
  strike_rate: number;
  dismissals: number;
  dismissal_pct: number;
  boundary_pct: number;
  dot_pct: number;
}

/* ─── API functions ─────────────────────────────────────────────────────── */

// Venues
export const getVenues = () => get<VenueSummary[]>("/venues");
export const getVenue = (venueName: string) =>
  get<VenueDetail>(`/venues/${encodeURIComponent(venueName)}`);

// Teams
export const getTeams = () => get<TeamSummary[]>("/teams");
export const getTeamStrength = (teamName: string) =>
  get<TeamStrength>(`/teams/${encodeURIComponent(teamName)}/strength`);

// Players
export const getPlayers = (search?: string) =>
  get<PlayerSummary[]>(`/players${qs({ search })}`);
export const getPlayer = (registryId: string) =>
  get<PlayerDetail>(`/players/${registryId}`);
export const getPlayerMatchup = (
  registryId: string,
  phase?: string,
  venue?: string,
) => get<PlayerMatchup>(`/players/${registryId}/matchup${qs({ phase, venue })}`);

/* ─── Full match detail (richer than MatchSummary) ──────────────────────── */

export interface InningsSummary {
  innings_number: number;
  total_runs: number;
  wickets: number;
  overs_completed: number;
}

export interface MatchDetail {
  id: string;
  event_name: string;
  season: string;
  date: string;
  venue: string;
  city: string;
  team1: string;
  team2: string;
  toss_winner: string;
  toss_decision: string;
  winner: string;
  win_by_runs: number | null;
  win_by_wickets: number | null;
  match_type: string;
  innings_summary: InningsSummary[];
}

export const getMatchDetail = (matchId: string) =>
  get<MatchDetail>(`/matches/${matchId}`);

// Matches
export const getMatches = (season?: string, team?: string) =>
  get<MatchSummary[]>(`/matches${qs({ season, team })}`);
export const getMatch = (matchId: string) =>
  get<MatchSummary>(`/matches/${matchId}`);
export const getMatchStory = (matchId: string) =>
  get<MatchStory>(`/matches/${matchId}/story`);

// Matchup oracle (batter in context)
export const getMatchup = (
  batterId?: string,
  phase?: string,
  venue?: string,
) =>
  get<TeamMatchup>(
    `/teams/matchup${qs({ batter_id: batterId, phase, venue })}`,
  );

/* ─── Commentary / Degen Agent ──────────────────────────────────────────── */

export interface CommentaryEntry {
  timestamp: string;
  commentary: string;
  type: "ball" | "over" | "milestone" | "demo";
  generated_at?: number;
  match?: string;
}

export interface DemoCommentary {
  entries: CommentaryEntry[];
  source: string;
}

export const getLiveCommentary = (matchId: string) =>
  get<CommentaryEntry>(`/commentary/live/${matchId}`);

export const getCommentaryHistory = (matchId: string) =>
  get<CommentaryEntry[]>(`/commentary/history/${matchId}`);

export const getDemoCommentary = () =>
  get<DemoCommentary>("/commentary/demo");

/* ─── Match Intelligence ─────────────────────────────────────────────────── */

export interface BowlerOverEntry {
  over_number: number;
  runs_conceded: number;
  balls: number;
  wickets: number;
  dots: number;
  is_maiden: boolean;
  economy: number;
}

export interface BowlerPhaseStats {
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface BowlerStats {
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
  dot_balls: number;
  dot_ball_pct: number;
  fours_conceded: number;
  sixes_conceded: number;
  wides: number;
  no_balls: number;
}

export interface BowlerEntry {
  name: string;
  impact_score: number;
  stats: BowlerStats;
  phase_breakdown: {
    powerplay: BowlerPhaseStats;
    middle: BowlerPhaseStats;
    death: BowlerPhaseStats;
  };
  over_by_over: BowlerOverEntry[];
}

export interface BowlingInningsData {
  team: string;
  bowlers: BowlerEntry[];
}

export interface MatchBowling {
  match_id: string;
  innings_1: BowlingInningsData;
  innings_2: BowlingInningsData;
}

export interface FieldingHero {
  name: string;
  team: string;
  catches: number;
  caught_and_bowled: number;
  run_outs: number;
  stumpings: number;
  fielding_score: number;
}

export interface DismissalBreakdown {
  caught: number;
  bowled: number;
  lbw: number;
  run_out: number;
  stumped: number;
  caught_and_bowled: number;
  other: number;
}

export interface MatchFielding {
  match_id: string;
  fielding_heroes: FieldingHero[];
  dismissal_breakdown: DismissalBreakdown;
}

export interface MVPEntry {
  name: string;
  team: string;
  batting_impact: number;
  bowling_impact: number;
  fielding_impact: number;
  total_impact: number;
  role: "batsman" | "bowler" | "allrounder";
}

export interface MatchImpact {
  match_id: string;
  mvp_ranking: MVPEntry[];
}

export const getMatchBowling = (matchId: string) =>
  get<MatchBowling>(`/matches/${matchId}/bowling`);

export const getMatchFielding = (matchId: string) =>
  get<MatchFielding>(`/matches/${matchId}/fielding`);

export const getMatchImpact = (matchId: string) =>
  get<MatchImpact>(`/matches/${matchId}/impact`);

/* ─── Batting ───────────────────────────────────────────────────────────── */

export interface BallEntry {
  over: number;
  ball: number;
  runs: number;
  extras: number;
  is_wicket: boolean;
}

export interface BatPhase {
  runs: number;
  balls: number;
  strike_rate: number;
}

export interface BatsmanDismissal {
  how_out: string;
  dismissed_by: string;
  fielder?: string | null;
}

export interface BatsmanEntry {
  name: string;
  batting_position: number;
  impact_score: number;
  stats: {
    runs: number;
    balls: number;
    strike_rate: number;
    fours: number;
    sixes: number;
    dot_balls: number;
    dot_ball_pct: number;
  };
  phase_breakdown: {
    powerplay: BatPhase;
    middle: BatPhase;
    death: BatPhase;
  };
  dismissal: BatsmanDismissal | null;
  ball_by_ball: BallEntry[];
}

export interface BattingInnings {
  team: string;
  batsmen: BatsmanEntry[];
}

export interface MatchBatting {
  match_id: string;
  innings_1: BattingInnings;
  innings_2: BattingInnings;
}

export const getMatchBatting = (matchId: string) =>
  get<MatchBatting>(`/matches/${matchId}/batting`);

/* ─── Points table ──────────────────────────────────────────────────────── */

export interface PointsTableEntry {
  team: string;
  full_name: string;
  matches_played: number;
  wins: number;
  losses: number;
  no_result: number;
  points: number;
  nrr: number;
  form: string[];
  position: number;
}

export interface PointsTableResponse {
  season: number;
  updated_at: string;
  table: PointsTableEntry[];
}

export const getPointsTable = () =>
  get<PointsTableResponse>("/points-table");

/* ─── Live match ─────────────────────────────────────────────────────────── */

export interface LiveMatchResponse extends MatchSummary {
  note?: string;          // present when no live match — shows most recent
  toss_winner?: string;
  toss_decision?: string;
  match_type?: string;
}

export const getLiveCurrentMatch = () =>
  get<LiveMatchResponse>("/matches/live/current");
