import { Model, DataTypes, Sequelize } from 'sequelize';
import { User } from '../models/User';
import Challenge from '../models/Challenge';
interface ChallengeParticipantAttributes {
challenge_id: number;
user_id: number;
joined_at: Date;
}
class ChallengeParticipant extends Model<ChallengeParticipantAttributes> {
public challenge_id!: number;
public user_id!: number;
public joined_at!: Date;
public static initialize(sequelize: Sequelize) {
const model = ChallengeParticipant.init(
{
challenge_id: {
type: DataTypes.INTEGER,
primaryKey: true,
allowNull: false,
references: {
model: 'challenges',
key: 'challenge_id'
}
},
user_id: {
type: DataTypes.INTEGER,
primaryKey: true,
allowNull: false,
references: {
model: 'users',
key: 'user_id'
}
},
joined_at: {
type: DataTypes.DATE,
allowNull: false,
defaultValue: DataTypes.NOW
}
},
{
sequelize,
modelName: 'ChallengeParticipant',
tableName: 'challenge_participants',
timestamps: true,
underscored: true,
indexes: [
{
fields: ['user_id']
}
]
}
);
return model;
}
public static associate(models: {
User: typeof User;
Challenge: typeof Challenge;
}): void {
// 관계는 User와 Challenge 모델에서 정의됨
}
}
export default ChallengeParticipant;