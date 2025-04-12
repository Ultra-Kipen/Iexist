// tests/unit/utils.test.ts

import { getPaginationOptions, getOrderClause } from '../../utils/utils';

describe('Pagination Utilities', () => {
  describe('getPaginationOptions', () => {
    test('기본값이 올바르게 설정되는지 확인', () => {
      const result = getPaginationOptions();
      expect(result).toEqual({
        limit: 10,
        offset: 0,
        page: 1
      });
    });

    test('페이지와 한계값이 올바르게 계산되는지 확인', () => {
      const result = getPaginationOptions('2', '20');
      expect(result).toEqual({
        limit: 20,
        offset: 20,
        page: 2
      });
    });

    test('페이지 수가 1보다 작으면 1로 설정되는지 확인', () => {
      const result = getPaginationOptions('0', '10');
      expect(result).toEqual({
        limit: 10,
        offset: 0,
        page: 1
      });
    });

    test('한계값이 최대값을 초과할 경우 최대값으로 설정되는지 확인', () => {
      const result = getPaginationOptions('1', '200');
      expect(result).toEqual({
        limit: 100, // 최대값은 100으로 설정되어 있는 것으로 가정
        offset: 0,
        page: 1
      });
    });

    test('한계값이 최소값 미만인 경우 최소값으로 설정되는지 확인', () => {
      const result = getPaginationOptions('1', '0');
      expect(result).toEqual({
        limit: 1, // 최소값은 1로 설정되어 있는 것으로 가정
        offset: 0,
        page: 1
      });
    });

    test('문자열이 아닌 인자를 처리할 수 있는지 확인', () => {
      // @ts-ignore - 의도적으로 타입 오류를 무시하여 예외 상황 테스트
      const result = getPaginationOptions(undefined, null);
      expect(result).toEqual({
        limit: 10,
        offset: 0,
        page: 1
      });
    });
  });

  describe('getOrderClause', () => {
    test('기본 정렬이 생성일 내림차순인지 확인', () => {
      const result = getOrderClause();
      expect(result).toEqual([['created_at', 'DESC']]);
    });

    test('인기순 정렬이 올바르게 설정되는지 확인', () => {
      const result = getOrderClause('popular');
      expect(result).toEqual([
        ['like_count', 'DESC'],
        ['comment_count', 'DESC'],
        ['created_at', 'DESC']
      ]);
    });

    test('최신순 정렬이 올바르게 설정되는지 확인', () => {
      const result = getOrderClause('latest');
      expect(result).toEqual([['created_at', 'DESC']]);
    });

    test('정렬 기준이 잘못 지정되면 기본값이 적용되는지 확인', () => {
      // @ts-ignore - 의도적으로 타입 오류를 무시하여 예외 상황 테스트
      const result = getOrderClause('invalid_order');
      expect(result).toEqual([['created_at', 'DESC']]);
    });
  });
});