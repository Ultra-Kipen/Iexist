# Iexist - 감정 공유 플랫폼

> 일상의 감정을 나누고 서로 위로받을 수 있는 소셜 플랫폼

## 📖 프로젝트 소개

Iexist는 사용자들이 자신의 일상과 감정을 공유하고, 익명으로 서로를 위로하고 응원할 수 있는 감정 기반 소셜 플랫폼입니다.

### 🌟 주요 기능

- **📝 나의 하루**: 일상 공유 및 감정 태그 기능
- **💙 위로의 벽**: 익명 고민 공유 및 상담 공간
- **🏆 감정 챌린지**: 긍정적인 감정 증진을 위한 그룹 활동
- **📊 일상 돌아보기**: 감정 변화 추적 및 통계
- **🔒 프라이버시**: 익명 모드 및 개인정보 보호

## 🛠 기술 스택

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - 웹 프레임워크
- **Sequelize** - ORM
- **MySQL** - 데이터베이스
- **Socket.IO** - 실시간 통신
- **JWT** - 인증/인가
- **Jest** - 테스트 프레임워크

### DevOps & Tools
- **Docker** - 컨테이너화
- **GitHub Actions** - CI/CD
- **ESLint** + **Prettier** - 코드 품질
- **Swagger** - API 문서화

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 14.0.0 이상
- MySQL 8.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/Ultra-Kipen/Iexist.git
cd Iexist

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에서 데이터베이스 정보 설정

# 데이터베이스 마이그레이션
npm run migrate

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

### 환경변수 설정 (.env)

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=iexist
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# CORS
FRONTEND_URL=http://localhost:3000
```

## 📚 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- Swagger UI: `http://localhost:3000/api-docs`

### 주요 엔드포인트

```
GET    /api/health          # 헬스 체크
POST   /api/users/register  # 회원가입
POST   /api/users/login     # 로그인
GET    /api/my-day          # 나의 하루 조회
POST   /api/my-day          # 나의 하루 작성
GET    /api/comfort-wall    # 위로의 벽 조회
POST   /api/comfort-wall    # 고민 작성
GET    /api/challenges      # 챌린지 목록
POST   /api/challenges      # 챌린지 생성
```

## 🧪 테스트

```bash
# 단위 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage

# 특정 테스트 실행
npm run test:unit
npm run test:integration
```

## 📁 프로젝트 구조

```
Iexist/
├── backend/
│   ├── controllers/     # 컨트롤러
│   ├── models/         # 데이터베이스 모델
│   ├── routes/         # 라우트 정의
│   ├── middleware/     # 미들웨어
│   ├── services/       # 비즈니스 로직
│   ├── utils/          # 유틸리티 함수
│   ├── tests/          # 테스트 파일
│   ├── config/         # 설정 파일
│   └── uploads/        # 파일 업로드 폴더
├── frontend/           # 프론트엔드 (추후 개발)
├── docs/              # 문서
└── docker/            # Docker 설정
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개발 가이드라인

- TypeScript 사용 필수
- ESLint 규칙 준수
- 테스트 코드 작성 권장
- 커밋 메시지는 한글로 작성
- PR 전에 `npm run lint` 실행

## 📋 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 개발팀

- **Ultra-Kipen** - *Initial work* - [@Ultra-Kipen](https://github.com/Ultra-Kipen)

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 언제든지 연락주세요!

- 이슈 등록: [GitHub Issues](https://github.com/Ultra-Kipen/Iexist/issues)
- 이메일: [연락처 이메일]

## 🔗 관련 링크

- [프로젝트 로드맵](docs/ROADMAP.md)
- [개발 가이드](docs/DEVELOPMENT.md)
- [API 문서](docs/API.md)
- [배포 가이드](docs/DEPLOYMENT.md)

---

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!
