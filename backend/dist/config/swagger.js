"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const config_1 = __importDefault(require("./config"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Iexist API 문서',
            version: config_1.default.api.version,
            description: '감정 기록 및 공유 플랫폼 API',
            contact: {
                name: 'API Support',
                email: 'support@iexist.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${config_1.default.server.port}${config_1.default.api.prefix}`,
                description: '개발 서버'
            },
            {
                url: `https://api.iexist.com${config_1.default.api.prefix}`,
                description: '운영 서버'
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
                            example: 'john@example.com'
                        },
                        nickname: {
                            type: 'string',
                            example: 'John'
                        },
                        profile_image_url: {
                            type: 'string',
                            example: 'https://example.com/image.jpg'
                        },
                        theme_preference: {
                            type: 'string',
                            enum: ['light', 'dark', 'system'],
                            example: 'system'
                        }
                    }
                },
                MyDayPost: {
                    type: 'object',
                    properties: {
                        post_id: {
                            type: 'integer',
                            example: 1
                        },
                        content: {
                            type: 'string',
                            example: '오늘 하루 감사했던 순간들...'
                        },
                        emotion_summary: {
                            type: 'string',
                            example: '행복'
                        },
                        image_url: {
                            type: 'string',
                            example: 'https://example.com/image.jpg'
                        },
                        is_anonymous: {
                            type: 'boolean',
                            example: false
                        }
                    }
                },
                SomeoneDayPost: {
                    type: 'object',
                    properties: {
                        post_id: {
                            type: 'integer',
                            example: 1
                        },
                        title: {
                            type: 'string',
                            example: '힘들었던 하루'
                        },
                        content: {
                            type: 'string',
                            example: '오늘은 정말 힘든 하루였지만...'
                        },
                        is_anonymous: {
                            type: 'boolean',
                            example: true
                        }
                    }
                },
                Challenge: {
                    type: 'object',
                    properties: {
                        challenge_id: {
                            type: 'integer',
                            example: 1
                        },
                        title: {
                            type: 'string',
                            example: '7일 감사 챌린지'
                        },
                        description: {
                            type: 'string',
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
    ],
    // 추가 옵션
    swaggerOptions: {
        persistAuthorization: true,
    }
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;
