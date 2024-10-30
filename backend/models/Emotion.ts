// src/models/Emotion.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export interface EmotionAttributes {
  emotion_id: number;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type EmotionCreationAttributes = Omit<EmotionAttributes, 'emotion_id' | 'createdAt' | 'updatedAt'>;

export class Emotion extends Model<EmotionAttributes, EmotionCreationAttributes> {
  declare emotion_id: number;
  declare name: string;
  declare description: string | null;
  declare icon: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize): void {
    Emotion.init(
      {
        emotion_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        icon: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'emotions',
        timestamps: true,
      }
    );
  }
}

// 기본 감정 데이터
export const defaultEmotions = [
  { name: '행복', description: '기쁘고 즐거운 감정', icon: 'emoticon-happy-outline' },
  { name: '감사', description: '고마움을 느끼는 감정', icon: 'hand-heart' },
  { name: '위로', description: '따뜻한 위로가 필요한 감정', icon: 'hand-peace' },
  { name: '감동', description: '마음이 움직이는 감정', icon: 'heart-outline' },
  { name: '슬픔', description: '슬프고 우울한 감정', icon: 'emoticon-sad-outline' },
  { name: '불안', description: '걱정되고 불안한 감정', icon: 'alert-outline' },
  { name: '화남', description: '화나고 짜증나는 감정', icon: 'emoticon-angry-outline' },
  { name: '지침', description: '피곤하고 지친 감정', icon: 'emoticon-neutral-outline' },
  { name: '우울', description: '기분이 가라앉는 감정', icon: 'weather-cloudy' },
  { name: '고독', description: '외롭고 쓸쓸한 감정', icon: 'account-outline' },
  { name: '충격', description: '놀랍고 충격적인 감정', icon: 'lightning-bolt' },
  { name: '편함', description: '평화롭고 편안한 감정', icon: 'sofa-outline' }
];

export function seedEmotions(sequelize: Sequelize) {
  return Emotion.bulkCreate(defaultEmotions, {
    ignoreDuplicates: true
  }).catch(error => {
    console.error('감정 데이터 시딩 중 오류 발생:', error);
    throw error;
  });
}