// backend/models/User.ts

import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
    public id!: number;
    public name!: string;
    public email!: string;

    // 모델 초기화 메서드
    static initialize(sequelize: Sequelize) {
        User.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
            },
            {
                sequelize,
                modelName: 'User',
                tableName: 'users',
                timestamps: true,
            }
        );
    }
}

export default User;
