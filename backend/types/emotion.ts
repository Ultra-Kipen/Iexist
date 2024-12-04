// backend/types/emotion.ts
export interface EmotionCreateDTO {
    emotion_ids: number[];
    note?: string;
  }
  
  export interface EmotionResponseDTO {
    status: string;
    message: string;
    data: any;
  }