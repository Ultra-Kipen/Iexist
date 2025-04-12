import { db } from '../../tests/setup';
import { mockChallengeData } from '../mocks/challengeMocks';

export const createTestChallenge = async (userId: number) => {
  try {
    const challenge = await db.Challenge.create({
      ...mockChallengeData,
      creator_id: userId
    });

    await db.ChallengeParticipant.create({
      challenge_id: challenge.get('challenge_id'),
      user_id: userId,
      created_at: new Date()
    });

    return challenge;
  } catch (error) {
    console.error('Error creating test challenge:', error);
    throw error;
  }
};

export const cleanupTestChallenges = async () => {
  try {
    await db.ChallengeParticipant.destroy({
      where: {},
      force: true
    });

    await db.ChallengeEmotion.destroy({
      where: {},
      force: true
    });

    await db.Challenge.destroy({
      where: {},
      force: true
    });
  } catch (error) {
    console.error('Error cleaning up test challenges:', error);
    throw error;
  }
};

export const createTestChallengeEmotion = async (
  challengeId: number,
  userId: number,
  emotionId: number
) => {
  try {
    const emotionLog = await db.ChallengeEmotion.create({
      challenge_id: challengeId,
      user_id: userId,
      emotion_id: emotionId,
      log_date: new Date(),
      note: '테스트 감정 기록',
      created_at: new Date()
    });

    return emotionLog;
  } catch (error) {
    console.error('Error creating test challenge emotion:', error);
    throw error;
  }
};