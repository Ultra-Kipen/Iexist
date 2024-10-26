// backend/models/User.ts

import { Model, DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public nickname?: string;
  public profile_image_url?: string;
  public theme_preference!: 'light' | 'dark' | 'system';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 비밀번호 해싱 메서드
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // 비밀번호 검증 메서드
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  static associate(models: any) {
    this.hasMany(models.MyDayPost, {
      foreignKey: 'user_id',
      as: 'myDayPosts'
    });

    this.hasMany(models.SomeoneDayPost, {
      foreignKey: 'user_id',
      as: 'someoneDayPosts'
    });
  }
}

export default User;
