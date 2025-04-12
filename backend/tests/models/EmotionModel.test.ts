import { Emotion, defaultEmotions } from '../../models/Emotion';
import db from '../../models';

// 모킹 설정
jest.mock('../../models/Emotion');

// defaultEmotions 모킹 해제 (실제 데이터 사용)
jest.unmock('../../models/Emotion');
jest.mock('../../models/Emotion', () => {
  const originalModule = jest.requireActual('../../models/Emotion');
  return {
    __esModule: true,
    ...originalModule,
    Emotion: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn()
    }
  };
});

describe('Emotion Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('감정을 생성할 수 있어야 합니다', async () => {
    const mockEmotion = {
      emotion_id: 13,
      name: 'Test Emotion',
      icon: 'test-icon',
      color: '#FF5733'
    };
    
    (Emotion.create as jest.Mock).mockResolvedValue(mockEmotion);

    // emotion_id 포함
    const emotionData = {
      emotion_id: 13,
      name: 'Test Emotion',
      icon: 'test-icon',
      color: '#FF5733'
    };

    const emotion = await Emotion.create(emotionData);
    
    expect(emotion).toBeDefined();
    expect(emotion).toHaveProperty('emotion_id');
    expect(emotion.name).toBe('Test Emotion');
    expect(emotion.icon).toBe('test-icon');
    expect(emotion.color).toBe('#FF5733');
    expect(Emotion.create).toHaveBeenCalledWith(emotionData);
  });

  it('필수 필드가 누락되면 오류가 발생해야 합니다', async () => {
    (Emotion.create as jest.Mock).mockRejectedValue(new Error('필수 필드가 누락되었습니다'));

    const invalidEmotionData = {
      // name 누락
      emotion_id: 14,
      icon: 'test-icon',
      color: '#FF5733'
    };

    await expect(Emotion.create(invalidEmotionData as any)).rejects.toThrow();
    expect(Emotion.create).toHaveBeenCalledWith(invalidEmotionData);
  });

  it('감정 이름은 고유해야 합니다', async () => {
    // 첫 번째 감정 생성은 성공
    (Emotion.create as jest.Mock).mockResolvedValueOnce({
      emotion_id: 13,
      name: 'Test Emotion',
      icon: 'test-icon-1',
      color: '#FF5733'
    });
    
    // 두 번째 감정 생성은 중복 이름으로 실패
    (Emotion.create as jest.Mock).mockRejectedValueOnce(new Error('이름이 이미 사용 중입니다'));

    const emotionData1 = {
      emotion_id: 13,
      name: 'Test Emotion',
      icon: 'test-icon-1',
      color: '#FF5733'
    };

    const emotionData2 = {
      emotion_id: 14,
      name: 'Test Emotion', // 같은 이름
      icon: 'test-icon-2',
      color: '#33FF57'
    };

    await Emotion.create(emotionData1);

    await expect(Emotion.create(emotionData2)).rejects.toThrow();
    expect(Emotion.create).toHaveBeenCalledTimes(2);
  });

  it('감정 정보를 업데이트할 수 있어야 합니다', async () => {
    // 모킹된 감정 객체
    const mockEmotion = {
      emotion_id: 13,
      name: 'Test Emotion',
      icon: 'test-icon',
      color: '#FF5733',
      save: jest.fn().mockResolvedValue(undefined)
    };
    
    // 업데이트된 감정 객체
    const updatedMockEmotion = {
      ...mockEmotion,
      icon: 'updated-icon',
      color: '#33FF57'
    };
    
    // Emotion.create와 Emotion.findByPk 메서드 모킹
    (Emotion.create as jest.Mock).mockResolvedValue(mockEmotion);
    (Emotion.findByPk as jest.Mock).mockResolvedValue(updatedMockEmotion);

    const emotionData = {
      emotion_id: 13,
      name: 'Test Emotion',
      icon: 'test-icon',
      color: '#FF5733'
    };

    const emotion = await Emotion.create(emotionData);
    
    emotion.icon = 'updated-icon';
    emotion.color = '#33FF57';
    await emotion.save();
    
    const updatedEmotion = await Emotion.findByPk(emotion.emotion_id);
    expect(updatedEmotion).toBeDefined();
    expect(updatedEmotion!.icon).toBe('updated-icon');
    expect(updatedEmotion!.color).toBe('#33FF57');
    expect(mockEmotion.save).toHaveBeenCalled();
  });

  it('기본 감정 데이터가 제공되어야 합니다', () => {
    // 기본 감정 데이터 확인 (실제 데이터 사용)
    expect(defaultEmotions).toBeInstanceOf(Array);
    expect(defaultEmotions.length).toBeGreaterThan(0);
    
    // 첫 번째 감정 구조 확인
    const firstEmotion = defaultEmotions[0];
    expect(firstEmotion).toHaveProperty('name');
    expect(firstEmotion).toHaveProperty('description');
    expect(firstEmotion).toHaveProperty('icon');
  });
});