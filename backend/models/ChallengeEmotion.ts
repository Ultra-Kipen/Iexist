import { Model, DataTypes, Sequelize } from 'sequelize';
import Challenge from '../models/Challenge';
import { User } from '../models/User';
import { Emotion } from '../models/Emotion';

interface ChallengeEmotionAttributes {
  challenge_emotion_id: number;
  challenge_id: number;
  user_id: number;
  emotion_id: number;
  note: string | null;  // VARCHAR(200), nullable
  log_date: Date;
}

class ChallengeEmotion extends Model<ChallengeEmotionAttributes> {
 public challenge_emotion_id!: number;
 public challenge_id!: number;
 public user_id!: number;
 public emotion_id!: number;
 public note!: string | null;  // 수정: null 명시적 허용
 public log_date!: Date;

 public static initialize(sequelize: Sequelize) {
   const model = ChallengeEmotion.init(
     {
       challenge_emotion_id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
       },
       challenge_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: {
           model: 'challenges',
           key: 'challenge_id'
         }
       },
       user_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: {
           model: 'users',
           key: 'user_id'
         }
       },
       emotion_id: {
         type: DataTypes.TINYINT.UNSIGNED,  // 수정: TINYINT UNSIGNED로 변경
         allowNull: false,
         references: {
           model: 'emotions',
           key: 'emotion_id'
         }
       },
       note: {
         type: DataTypes.STRING(200),  // 수정: VARCHAR(200)로 명시적 지정
         allowNull: true,
         defaultValue: null
       },
       log_date: {
         type: DataTypes.DATEONLY,
         allowNull: false,
         defaultValue: DataTypes.NOW
       }
     },
     {
       sequelize,
       modelName: 'ChallengeEmotion',
       tableName: 'challenge_emotions',
       timestamps: true,
       underscored: true,
       indexes: [
         {
           fields: ['challenge_id', 'user_id', 'log_date'],
           unique: true
         },
         {
           fields: ['emotion_id']
         }
       ]
     }
   );
   return model;
 }

 public static associate(models: {
   Challenge: typeof Challenge;
   User: typeof User;
   Emotion: typeof Emotion;
 }): void {
   ChallengeEmotion.belongsTo(models.Challenge, {
     foreignKey: 'challenge_id',
     as: 'challenge'
   });

   ChallengeEmotion.belongsTo(models.User, {
     foreignKey: 'user_id',
     as: 'user'
   });

   ChallengeEmotion.belongsTo(models.Emotion, {
     foreignKey: 'emotion_id',
     as: 'emotion'
   });
 }
}

export default ChallengeEmotion;