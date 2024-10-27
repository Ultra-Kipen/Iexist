import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';

class Emotion extends Model {
    public id!: number;
    public name!: string;
    public icon!: string;
    public color?: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // 모델 초기화 메서드 추가
    public static initialize(sequelize: Sequelize): void {
        Emotion.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    unique: true,
                },
                icon: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                },
                color: {
                    type: DataTypes.STRING(7),
                    allowNull: true,
                    validate: {
                        is: /^#[0-9A-Fa-f]{6}$/,
                    },
                },
            },
            {
                sequelize,
                modelName: 'Emotion',
                tableName: 'emotions',
                timestamps: true,
                underscored: true,
            }
        );
    }

    // 모델 관계 설정 메서드
    public static associate(models: any): void {
        this.belongsToMany(models.MyDayPost, {
            through: 'my_day_emotions',
            foreignKey: 'emotion_id',
            otherKey: 'post_id',
            as: 'myDayPosts',
        });

        this.hasMany(models.EmotionLog, {
            foreignKey: 'emotion_id',
            as: 'emotionLogs',
        });

        this.belongsToMany(models.Challenge, {
            through: 'challenge_emotions',
            foreignKey: 'emotion_id',
            otherKey: 'challenge_id',
            as: 'challenges',
        });
    }
}

// Emotion 모델을 초기화하고 내보냅니다.
Emotion.initialize(sequelize);

export default Emotion;