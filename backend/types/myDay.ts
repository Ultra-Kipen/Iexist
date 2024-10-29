export interface MyDayComment {
  content: string;
}

export interface PostParams {
  id: string;
}

export interface MyDayPost {
  content: string;
  emotion_ids?: number[];
  is_anonymous?: boolean;
}

export interface MyDayQuery {
  limit?: string;
  offset?: string;
}