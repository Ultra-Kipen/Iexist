// components/TagSearchInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Keyboard 
} from 'react-native';
import tagService from '../services/api/tagService';

// 타입 정의
interface Tag {
  tag_id: number;
  name: string;
}

interface TagSearchInputProps {
  onTagSelect: (tag: Tag) => void;
  selectedTags?: Tag[];
  placeholder?: string;
  maxTags?: number;
}

const TagSearchInput: React.FC<TagSearchInputProps> = ({
  onTagSelect,
  selectedTags = [],
  placeholder = '태그를 검색하세요',
  maxTags = 5
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);
  
  // 선택된 태그 ID 목록
  const selectedTagIds = selectedTags.map(tag => tag.tag_id);
  
  // 태그 목록 가져오기
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        // 실제 API 호출
        const response = await tagService.getAllTags();
        if (response && response.data && response.data.data) {
          setTags(response.data.data);
        } else {
          // 응답 형식이 예상과 다를 경우 대비한 모의 데이터
          const mockTags = [
            { tag_id: 1, name: '일상' },
            { tag_id: 2, name: '감정' },
            { tag_id: 3, name: '고민' },
            { tag_id: 4, name: '행복' },
            { tag_id: 5, name: '슬픔' }
          ];
          setTags(mockTags);
        }
      } catch (error) {
        console.error('태그 가져오기 오류:', error);
        // 오류 발생 시 기본 태그 목록 제공
        const fallbackTags = [
          { tag_id: 1, name: '일상' },
          { tag_id: 2, name: '감정' }
        ];
        setTags(fallbackTags);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTags();
  }, []);
  
  // 검색어에 따라 태그 필터링
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredTags([]);
      return;
    }
    
    const filtered = tags.filter(tag => 
      tag.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !selectedTagIds.includes(tag.tag_id)
    );
    
    setFilteredTags(filtered);
    setIsDropdownVisible(filtered.length > 0);
  }, [searchText, tags, selectedTagIds]);
  
  // 검색어 변경 핸들러
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setIsDropdownVisible(false);
    }
  };
  
  // 태그 클릭 핸들러
  const handleTagPress = (tag: Tag) => {
    // 태그 최대 개수 확인
    if (selectedTags.length >= maxTags) {
      return;
    }
    
    onTagSelect(tag);
    setSearchText('');
    setIsDropdownVisible(false);
    inputRef.current?.focus();
  };
  
  // 태그 생성 핸들러 (검색 결과가 없을 때)
  const handleCreateTag = async () => {
    if (searchText.trim().length < 2) {
      return;
    }
    
    try {
      setLoading(true);
      // 실제 API 호출로 태그 생성
      const response = await tagService.createTag(searchText.trim());
      
      if (response && response.data && response.data.data) {
        const newTag = response.data.data;
        
        // 태그 목록에 추가
        setTags(prevTags => [...prevTags, newTag]);
        
        // 선택된 태그로 추가
        onTagSelect(newTag);
      } else {
        // 응답이 예상과 다른 경우 모의 태그 생성
        const newTag = {
          tag_id: Math.floor(Math.random() * 10000) + 100,
          name: searchText.trim()
        };
        
        // 태그 목록에 추가
        setTags(prevTags => [...prevTags, newTag]);
        
        // 선택된 태그로 추가
        onTagSelect(newTag);
      }
      
      setSearchText('');
      setIsDropdownVisible(false);
    } catch (error) {
      console.error('태그 생성 오류:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 선택된 태그 렌더링
  const renderSelectedTags = () => {
    if (selectedTags.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.selectedTagsContainer}>
        {selectedTags.map((tag) => (
          <View key={tag.tag_id} style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>#{tag.name}</Text>
          </View>
        ))}
      </View>
    );
  };
  
  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const hideDropdown = () => {
      setIsDropdownVisible(false);
    };
    
    Keyboard.addListener('keyboardDidHide', hideDropdown);
    
    return () => {
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);
  
  return (
    <View style={styles.container}>
      {/* 선택된 태그들 */}
      {renderSelectedTags()}
      
      {/* 태그 최대 개수 도달 메시지 */}
      {selectedTags.length >= maxTags ? (
        <Text style={styles.maxTagsText}>최대 {maxTags}개의 태그까지 선택할 수 있습니다.</Text>
      ) : (
        <>
          {/* 검색 입력 */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder={selectedTags.length === 0 ? placeholder : `태그 추가 (${selectedTags.length}/${maxTags})`}
            onFocus={() => searchText.trim() !== '' && setIsDropdownVisible(true)}
            onSubmitEditing={() => {
              if (filteredTags.length > 0) {
                handleTagPress(filteredTags[0]);
              } else if (searchText.trim() !== '') {
                handleCreateTag();
              }
            }}
          />
          
          {/* 로딩 인디케이터 */}
          {loading && (
            <ActivityIndicator size="small" color="#4A6572" style={styles.loading} />
          )}
          
          {/* 검색 결과 드롭다운 */}
          {isDropdownVisible && (
            <View style={styles.dropdown}>
              <FlatList
                data={filteredTags}
                keyExtractor={(item) => item.tag_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleTagPress(item)}
                  >
                    <Text style={styles.dropdownItemText}>#{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  searchText.trim().length >= 2 ? (
                    <TouchableOpacity
                      style={styles.createTagButton}
                      onPress={handleCreateTag}
                    >
                      <Text style={styles.createTagText}>
                        "{searchText}" 태그 만들기
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.noResultsText}>
                      검색 결과가 없습니다. 2자 이상 입력하여 새 태그를 만들 수 있습니다.
                    </Text>
                  )
                }
                style={styles.dropdownList}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: '#E8EDF0',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    fontSize: 14,
    color: '#4A6572',
  },
  maxTagsText: {
    fontSize: 14,
    color: '#657786',
    marginTop: 8,
    fontStyle: 'italic',
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E8ED',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#14171A',
  },
  createTagButton: {
    padding: 12,
    backgroundColor: '#F2F7FA',
  },
  createTagText: {
    fontSize: 14,
    color: '#4A6572',
    fontWeight: '600',
  },
  noResultsText: {
    padding: 12,
    fontSize: 14,
    color: '#657786',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loading: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
});

export default TagSearchInput;