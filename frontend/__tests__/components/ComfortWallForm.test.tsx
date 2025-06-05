import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ComfortWallForm from '../../src/components/ComfortWallForm';
import { Alert } from 'react-native';

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockClear();
});

// TagSelector 컴포넌트 모킹 - 외부에서 onTagSelect 접근 가능하도록 설정
let tagSelectorOnTagSelect: ((arg0: number) => void) | null = null;

// TagSelector 모킹
jest.mock('../../src/components/TagSelector', () => {
  return function MockTagSelector(props: { onTagSelect: ((arg0: number) => void) | null; }) {
    // 모킹된 함수 외부에서 접근할 수 있도록 저장
    tagSelectorOnTagSelect = props.onTagSelect;
    return null;
  };
});

// LoadingIndicator 모킹 - 인디케이터가 있는지만 확인
let loadingIndicatorRendered = false;

jest.mock('../../src/components/LoadingIndicator', () => {
  return function MockLoadingIndicator() {
    loadingIndicatorRendered = true;
    return null;
  };
});

describe('ComfortWallForm 컴포넌트', () => {
  const mockSubmit = jest.fn().mockResolvedValue(undefined);
  
  beforeEach(() => {
    jest.clearAllMocks();
    (Alert.alert as jest.Mock).mockClear();
    tagSelectorOnTagSelect = null;
    loadingIndicatorRendered = false;
  });

  it('폼이 올바르게 렌더링되어야 함', () => {
    const { getByPlaceholderText, getByText } = render(
      <ComfortWallForm onSubmit={mockSubmit} />
    );
    
    // 제목 필드가 있는지 확인
    const titleInput = getByPlaceholderText('제목을 입력하세요 (5-100자)');
    expect(titleInput).toBeDefined();
    
    // 내용 필드가 있는지 확인
    const contentInput = getByPlaceholderText('당신의 고민을 자유롭게 적어주세요 (20-2000자)');
    expect(contentInput).toBeDefined();
    
    // 제출 버튼이 있는지 확인
    const submitButton = getByText('작성 완료');
    expect(submitButton).toBeDefined();
    
    // 익명 옵션이 있는지 확인
    const anonymousText = getByText('익명으로 게시하기');
    expect(anonymousText).toBeDefined();
  });

  it('내용 입력 시 상태가 업데이트되어야 함', async () => {
    const { getByPlaceholderText } = render(
      <ComfortWallForm onSubmit={mockSubmit} />
    );
    
    const titleInput = getByPlaceholderText('제목을 입력하세요 (5-100자)');
    const contentInput = getByPlaceholderText('당신의 고민을 자유롭게 적어주세요 (20-2000자)');
    
    await act(async () => {
      fireEvent.changeText(titleInput, '테스트 제목');
    });
    
    await act(async () => {
      fireEvent.changeText(contentInput, '테스트 내용입니다.');
    });
    
    expect(titleInput.props.value).toBe('테스트 제목');
    expect(contentInput.props.value).toBe('테스트 내용입니다.');
  });

  it('폼 제출 시 기본 익명 상태(true)로 제출되어야 함', async () => {
    mockSubmit.mockImplementation(() => Promise.resolve());
    
    const { getByPlaceholderText, getByText } = render(
      <ComfortWallForm onSubmit={mockSubmit} />
    );
    
    const titleInput = getByPlaceholderText('제목을 입력하세요 (5-100자)');
    const contentInput = getByPlaceholderText('당신의 고민을 자유롭게 적어주세요 (20-2000자)');
    
    // 제목과 내용 입력 - 유효성 검사를 통과하기 위해 충분한 길이로 입력
    await act(async () => {
      fireEvent.changeText(titleInput, '테스트 제목입니다');
    });
    
    await act(async () => {
      fireEvent.changeText(contentInput, '테스트 내용입니다. 충분히 긴 내용으로 작성합니다. 최소 20자 이상이 필요합니다.');
    });
    
    // 제출 버튼 클릭
    const submitButton = getByText('작성 완료');
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    expect(mockSubmit).toHaveBeenCalledWith({
      title: '테스트 제목입니다',
      content: '테스트 내용입니다. 충분히 긴 내용으로 작성합니다. 최소 20자 이상이 필요합니다.',
      is_anonymous: true,
      tag_ids: []
    });
  });
  

  it('태그 선택이 작동해야 함', async () => {
    mockSubmit.mockImplementation(() => Promise.resolve());
    
    const { getByPlaceholderText, getByText } = render(
      <ComfortWallForm onSubmit={mockSubmit} />
    );
    
    const titleInput = getByPlaceholderText('제목을 입력하세요 (5-100자)');
    const contentInput = getByPlaceholderText('당신의 고민을 자유롭게 적어주세요 (20-2000자)');
    
    // 제목과 내용 입력
    await act(async () => {
      fireEvent.changeText(titleInput, '테스트 제목입니다');
    });
    
    await act(async () => {
      fireEvent.changeText(contentInput, '테스트 내용입니다. 충분히 긴 내용으로 작성합니다. 최소 20자 이상이 필요합니다.');
    });
    
    // TagSelector의 onTagSelect 함수 직접 호출
    expect(tagSelectorOnTagSelect).toBeDefined();
    
    // act로 감싸서 상태 업데이트 처리
    await act(async () => {
      if (tagSelectorOnTagSelect) {
        tagSelectorOnTagSelect(1); // 태그 ID 1 선택
      }
    });
    
    // 제출 버튼 클릭
    const submitButton = getByText('작성 완료');
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    expect(mockSubmit).toHaveBeenCalledWith({
      title: '테스트 제목입니다',
      content: '테스트 내용입니다. 충분히 긴 내용으로 작성합니다. 최소 20자 이상이 필요합니다.',
      is_anonymous: true,
      tag_ids: [1]
    });
  });
  

  it('내용이 너무 짧으면 제출되지 않아야 함', async () => {
    jest.clearAllMocks();
    
    const { getByPlaceholderText, getByText } = render(
      <ComfortWallForm onSubmit={mockSubmit} />
    );
    
    const titleInput = getByPlaceholderText('제목을 입력하세요 (5-100자)');
    const contentInput = getByPlaceholderText('당신의 고민을 자유롭게 적어주세요 (20-2000자)');
    
    // 제목은 충분히 길지만 내용이 짧은 경우
    fireEvent.changeText(titleInput, '충분히 긴 제목');
    fireEvent.changeText(contentInput, '짧은 내용');
    
    // 제출 버튼 클릭
    const submitButton = getByText('작성 완료');
    fireEvent.press(submitButton);
    
    // 제출 함수가 호출되지 않아야 함
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('제목이 너무 짧으면 제출되지 않아야 함', async () => {
    jest.clearAllMocks();
    
    const { getByPlaceholderText, getByText } = render(
      <ComfortWallForm onSubmit={mockSubmit} />
    );
    
    const titleInput = getByPlaceholderText('제목을 입력하세요 (5-100자)');
    const contentInput = getByPlaceholderText('당신의 고민을 자유롭게 적어주세요 (20-2000자)');
    
    // 제목이 너무 짧고 내용은 충분히 긴 경우
    fireEvent.changeText(titleInput, '짧');
    fireEvent.changeText(contentInput, '충분히 긴 내용입니다. 이 내용은 20자를 넘어야 합니다.');
    
    // 제출 버튼 클릭
    const submitButton = getByText('작성 완료');
    fireEvent.press(submitButton);
    
    // 제출 함수가 호출되지 않아야 함
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('제출 실패 시 에러 처리가 되어야 함', async () => {
    const mockError = new Error('제출 실패');
    mockSubmit.mockRejectedValueOnce(mockError);
    
    const { getByPlaceholderText, getByText } = render(
      <ComfortWallForm onSubmit={mockSubmit} />
    );
    
    const titleInput = getByPlaceholderText('제목을 입력하세요 (5-100자)');
    const contentInput = getByPlaceholderText('당신의 고민을 자유롭게 적어주세요 (20-2000자)');
    
    // 제목과 내용 입력
    await act(async () => {
      fireEvent.changeText(titleInput, '테스트 제목입니다');
    });
    
    await act(async () => {
      fireEvent.changeText(contentInput, '테스트 내용입니다. 충분히 긴 내용으로 작성합니다. 최소 20자 이상이 필요합니다.');
    });
    
    // 제출 버튼 클릭
    const submitButton = getByText('작성 완료');
    await act(async () => {
      fireEvent.press(submitButton);
    });
    
    // Alert.alert 호출 여부를 확인
    expect(Alert.alert).toHaveBeenCalledWith(
      '오류',
      '게시물 작성 중 문제가 발생했습니다. 다시 시도해주세요.'
    );
    
    // 폼이 초기화되지 않았는지 확인 (에러 발생 시에는 초기화되지 않음)
    expect(titleInput.props.value).toBe('테스트 제목입니다');
    expect(contentInput.props.value).toBe('테스트 내용입니다. 충분히 긴 내용으로 작성합니다. 최소 20자 이상이 필요합니다.');
  });

  it('로딩 상태일 때 로딩 인디케이터가 표시되어야 함', () => {
    render(
      <ComfortWallForm onSubmit={mockSubmit} isLoading={true} />
    );
    
    // 로딩 인디케이터가 표시되었는지 확인
    expect(loadingIndicatorRendered).toBe(true);
  });
});