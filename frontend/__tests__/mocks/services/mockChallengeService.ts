// __tests__/mocks/services/mockChallengeService.ts
export const mockChallengeService = {
    getChallengeDetails: jest.fn().mockResolvedValue({
      data: {
        challenge_id: 1,
        title: '일주일 동안 행복한 순간 기록하기',
        description: '매일 행복했던 순간을 하나씩 기록해보세요.',
      }
    }),
    participateInChallenge: jest.fn().mockResolvedValue({ data: { success: true } })
  };