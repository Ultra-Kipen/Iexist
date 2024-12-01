import { Model, DataTypes, Sequelize } from 'sequelize';
import { User } from '../models/User';
import Tag from '../models/Tag';
import EncouragementMessage from '../models/EncouragementMessage';

interface SomeoneDayPostAttributes {
 post_id?: number; 
 user_id: number;
 title: string;
 content: string;
 summary?: string;
 image_url?: string;
 is_anonymous: boolean;
 character_count?: number;
 like_count: number;
 comment_count: number;

 created_at?: Date;
  updated_at?: Date;
 user?: {
   nickname: string;
   profile_image_url?: string;
 };
 tags?: Array<{
   tag_id: number;
   name: string;
 }>;
}

class SomeoneDayPost extends Model<SomeoneDayPostAttributes> {
 public post_id!: number;
 public user_id!: number;
 public title!: string;
 public content!: string;
 public summary?: string;
 public image_url?: string;
 public is_anonymous!: boolean;
 public character_count?: number;
 public like_count!: number;
 public comment_count!: number;


 static async findById(id: number) {
  return this.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['nickname', 'profile_image_url']
      },
      {
        model: Tag,
        as: 'tags',
        through: { attributes: [] }
      }
    ]
  });
}

 public static initialize(sequelize: Sequelize) {
   const model = SomeoneDayPost.init(
     {
       post_id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
       },
       user_id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: {
           model: 'users',
           key: 'user_id'
         }
       },
       title: {
         type: DataTypes.STRING(100),
         allowNull: false,
         validate: {
           len: [5, 100]
         }
       },
       content: {
         type: DataTypes.TEXT,
         allowNull: false,
         validate: {
           len: [20, 2000]
         }
       },
       summary: {
         type: DataTypes.STRING(200),
         allowNull: true
       },
       image_url: {
         type: DataTypes.STRING(255),
         allowNull: true
       },
       is_anonymous: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: false
       },
       character_count: {
         type: DataTypes.INTEGER,
         allowNull: true
       },
       like_count: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 0
       },
       comment_count: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 0
       },
           },
     {
       sequelize,
       modelName: 'SomeoneDayPost',
       tableName: 'someone_day_posts',
       timestamps: true,
       underscored: true,
       indexes: [
         {
           fields: ['user_id']
         },
         {
           fields: ['created_at']
         },
         {
           fields: ['like_count']
         }
       ]
     }
   );
   return model;
 }

 public static associate(models: {
  User: typeof User;
  Tag: typeof Tag;
  EncouragementMessage: typeof EncouragementMessage; // 추가
}): void {
   SomeoneDayPost.belongsTo(models.User, {
     foreignKey: 'user_id',
     as: 'user'
   });

   SomeoneDayPost.belongsToMany(models.Tag, {
     through: 'someone_day_tags',
     foreignKey: 'post_id',
     otherKey: 'tag_id',
     as: 'tags'
   });
   SomeoneDayPost.hasMany(models.EncouragementMessage, {
    foreignKey: 'post_id',
    as: 'encouragement_messages'
  });
}
}

export default SomeoneDayPost;