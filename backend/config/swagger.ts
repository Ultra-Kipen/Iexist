// backend/config/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';
import config from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Iexist API',
      version: '1.0.0', // 하드코딩된 버전으로 변경
      description: 'Iexist API Documentation',
    },
    servers: [
      {
        url: `http://localhost:3000/api`, // 하드코딩된 포트와 prefix로 변경
        description: '개발 서버'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['status', 'message'],
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: '오류가 발생했습니다.'
            }
          }
        },
        User: {
          type: 'object',
          required: ['username', 'email'],
          properties: {
            user_id: {
              type: 'integer',
              example: 1
            },
            username: {
              type: 'string',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            nickname: {
              type: 'string',
              example: 'John'
            },
            profile_image_url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/image.jpg'
            },
            theme_preference: {
              type: 'string',
              enum: ['light', 'dark', 'system'],
              default: 'system'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        MyDayPost: {
          type: 'object',
          required: ['content'],
          properties: {
            post_id: {
              type: 'integer',
              example: 1
            },
            content: {
              type: 'string',
              maxLength: 1000,
              example: '오늘 하루 감사했던 순간들...'
            },
            emotion_summary: {
              type: 'string',
              example: '행복'
            },
            image_url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/image.jpg'
            },
            is_anonymous: {
              type: 'boolean',
              default: false
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        SomeoneDayPost: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            post_id: {
              type: 'integer',
              example: 1
            },
            title: {
              type: 'string',
              maxLength: 100,
              example: '힘들었던 하루'
            },
            content: {
              type: 'string',
              maxLength: 2000,
              example: '오늘은 정말 힘든 하루였지만...'
            },
            is_anonymous: {
              type: 'boolean',
              default: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Challenge: {
          type: 'object',
          required: ['title', 'description', 'start_date', 'end_date'],
          properties: {
            challenge_id: {
              type: 'integer',
              example: 1
            },
            title: {
              type: 'string',
              maxLength: 100,
              example: '7일 감사 챌린지'
            },
            description: {
              type: 'string',
              maxLength: 500,
              example: '매일 감사한 일 3가지 기록하기'
            },
            start_date: {
              type: 'string',
              format: 'date',
              example: '2024-03-01'
            },
            end_date: {
              type: 'string',
              format: 'date',
              example: '2024-03-07'
            },
            is_public: {
              type: 'boolean',
              default: true
            },
            max_participants: {
              type: 'integer',
              minimum: 1,
              example: 100
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export default specs;