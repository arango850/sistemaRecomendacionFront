export interface MovieRecommendation {
  movie_id: number;
  movie_title: string;
  score: number;
}

export interface UserRecommendation {
  user_id: number;
  cluster: number;
  recommendations: MovieRecommendation[];
}
