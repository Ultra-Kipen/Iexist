import { Model, DataTypes, Sequelize } from 'sequelize';

export interface EmotionAttributes {
  emotion_id: number;
  name: string;
  icon: string;
  color: string;
  created_at?: Date;
  updated_at?: Date;
}
interface EmotionLogAttributes {
  log_id?: number;  // optional로 변경
  user_id: number;
  emotion_id: number;
  log_date: Date;
  note: string | null;
}
export class Emotion extends Model<EmotionAttributes> {
  public emotion_id!: number;
  public name!: string;
  public icon!: string;
  public color!: string;
  public created_at!: Date;
  public updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    const model = Emotion.init(
      {
        emotion_id: {
          type: DataTypes.TINYINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        },
        icon: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        color: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'Emotion',
        tableName: 'emotions',
        timestamps: true,
        underscored: true
      }
    );
    return model;
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

export default Emotion;