// src/components/EmotionSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Emotion {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface EmotionSelectorProps {
  emotions: Emotion[];
  selectedEmotions: number[];
  onSelect: (emotionId: number) => void;
  multiple?: boolean;
  containerStyle?: object;
}

const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  emotions,
  selectedEmotions,
  onSelect,
  multiple = true,
  containerStyle,
}) => {
  const handleSelect = (emotionId: number) => {
    onSelect(emotionId);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>오늘의 감정</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {emotions.map((emotion) => {
          const isSelected = selectedEmotions.includes(emotion.id);
          return (
            <TouchableOpacity
              key={emotion.id}
              style={[
                styles.emotionItem,
                isSelected && { backgroundColor: `${emotion.color}20` },
              ]}
              onPress={() => handleSelect(emotion.id)}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: isSelected ? emotion.color : '#EEEEEE' }
              ]}>
                <Text style={[
                  styles.iconText,
                  { color: isSelected ? '#FFFFFF' : '#BBBBBB' }
                ]}>
                  {emotion.name.charAt(0)}
                </Text>
              </View>
              <Text
                style={[
                  styles.emotionName,
                  isSelected && { color: emotion.color, fontWeight: '600' },
                ]}
              >
                {emotion.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
    color: '#333333',
  },
  scrollView: {
    paddingHorizontal: 8,
  },
  emotionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    minWidth: 70,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emotionName: {
    marginTop: 6,
    fontSize: 12,
    color: '#666666',
  },
});

export default EmotionSelector;