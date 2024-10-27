"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_json_1 = __importDefault(require("../config/config.json"));
const env = process.env.NODE_ENV || 'development';
const dbConfig = config_json_1.default[env];
if (!dbConfig) {
    throw new Error(`데이터베이스 설정을 찾을 수 없습니다. (환경: ${env})`);
}
if (!dbConfig.database || !dbConfig.username) {
    throw new Error('데이터베이스 설정이 올바르지 않습니다.');
}
const sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password || '', {
    host: dbConfig.host || 'localhost',
    dialect: dbConfig.dialect || 'mysql',
    port: dbConfig.port || 3306,
    timezone: dbConfig.timezone || '+09:00',
    logging: env === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true,
        paranoid: true
    }
});
const db = {
    sequelize,
    Sequelize: sequelize_1.Sequelize
};
// 모델 로딩 순서 정의 (의존성 순서 고려)
const modelOrder = [
    'User',
    'Emotion',
    'EmotionLog',
    'Tag',
    'MyDayPost',
    'MyDayComment',
    'MyDayLike',
    'SomeoneDayPost',
    'SomeoneDayComment',
    'SomeoneDayLike',
    'Challenge',
    'ChallengeParticipant',
    'ChallengeEmotion',
    'UserStats',
    'Notification',
    'PostReport',
    'EncouragementMessage'
];
// 모델 파일 경로 가져오기
const modelFiles = fs.readdirSync(__dirname)
    .filter(file => {
    return (file.indexOf('.') !== 0 &&
        file !== 'index.ts' &&
        file.indexOf('.test.') === -1 &&
        file.indexOf('.d.ts') === -1 &&
        (file.endsWith('.ts') || file.endsWith('.js')));
});
// 정의된 순서대로 모델 초기화
try {
    // 먼저 정의된 순서대로 모델 초기화
    for (const modelName of modelOrder) {
        const fileName = modelFiles.find(file => file.toLowerCase().includes(modelName.toLowerCase()));
        if (fileName) {
            const modelPath = path.join(__dirname, fileName);
            const model = require(modelPath);
            if (model.default && typeof model.default === 'function') {
                const Model = model.default(sequelize);
                db[Model.name] = Model;
            }
            else {
                console.warn(`경고: ${fileName} 모델이 올바른 형식이 아닙니다.`);
            }
        }
        else {
            console.warn(`경고: ${modelName} 모델 파일을 찾을 수 없습니다.`);
        }
    }
    // 나머지 모델들 초기화
    const remainingFiles = modelFiles.filter(file => !modelOrder.some(model => file.toLowerCase().includes(model.toLowerCase())));
    for (const file of remainingFiles) {
        const modelPath = path.join(__dirname, file);
        const model = require(modelPath);
        if (model.default && typeof model.default === 'function') {
            const Model = model.default(sequelize);
            db[Model.name] = Model;
            console.info(`추가 모델 로드됨: ${Model.name}`);
        }
    }
    // 모든 모델의 관계 설정
    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate && typeof db[modelName].associate === 'function') {
            try {
                db[modelName].associate(db);
            }
            catch (error) {
                console.error(`모델 관계 설정 오류 (${modelName}):`, error);
            }
        }
    });
}
catch (error) {
    console.error('모델 초기화 중 오류 발생:', error);
    throw error;
}
// 데이터베이스 연결 테스트
sequelize
    .authenticate()
    .then(() => {
    console.info('데이터베이스 연결 성공');
})
    .catch(err => {
    console.error('데이터베이스 연결 실패:', err);
});
exports.default = db;
