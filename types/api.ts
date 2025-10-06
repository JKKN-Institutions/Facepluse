import { FaceAnalysis, LeaderboardEntry } from './face'

export interface AnalyzeFaceRequest {
  image: string
}

export interface AnalyzeFaceResponse extends FaceAnalysis {}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
}

export interface AddScoreRequest {
  score: number
}

export interface AddScoreResponse extends LeaderboardEntry {}
