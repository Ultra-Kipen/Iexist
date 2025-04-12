// src/screens/StatisticsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Button, Card, Chip, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import apiClient from '../services/api/client';

interface StatisticsScreenProps {
  navigation: any;
  route: any;
}

type PeriodType = 'daily' | 'weekly' | 'monthly';

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ navigation }) => {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [statistics, setStatistics] = useState<any>({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);
  const [emotions, setEmotions] = useState<any[]>([]);

  useEffect(() => {
    fetchEmotions();
    fetchStatistics();
  }, []);

  const fetchEmotions = async () => {
    try {
      const response = await apiClient.get('/emotions');
      setEmotions(response.data.emotions || []);
    } catch (error) {
      console.error('감정 로드 오류:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/statistics/emotions');
      setStatistics(response.data.statistics || {
        daily: [],
        weekly: [],
        monthly: []
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionName = (emotionId: number) => {
    const emotion = emotions.find(e => e.emotion_id === emotionId);
    return emotion ? emotion.name : '알 수 없음';
  };

  const getEmotionColor = (emotionId: number) => {
    const emotion = emotions.find(e => e.emotion_id === emotionId);
    return emotion ? emotion.color : '#999999';
  };

  const getEmotionIcon = (emotionId: number) => {
    const emotion = emotions.find(e => e.emotion_id === emotionId);
    return emotion ? emotion.icon : 'help-circle-outline';
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily':
        return '일간 감정 통계';
      case 'weekly':
        return '주간 감정 통계';
      case 'monthly':
        return '월간 감정 통계';
      default:
        return '감정 통계';
    }
  };

  const preparePieChartData = () => {
    const currentData = statistics[period] || [];
    
    // 감정 ID별로 데이터 그룹화
    const groupedByEmotion = currentData.reduce((acc: any, item: any) => {
      const emotionId = item.emotion_id;
      if (!acc[emotionId]) {
        acc[emotionId] = 0;
      }
      acc[emotionId] += item.count;
      return acc;
    }, {});
    
    // 차트 데이터 형식으로 변환
    return Object.keys(groupedByEmotion).map(emotionId => {
      const id = Number(emotionId);
      return {
        name: getEmotionName(id),
        count: groupedByEmotion[emotionId],
        color: getEmotionColor(id),
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    });
  };

  const prepareLineChartData = () => {
    const currentData = statistics[period] || [];
    const sortedData = [...currentData].sort((a, b) => {
      const aDate = a.date || a.week || a.month;
      const bDate = b.date || b.week || b.month;
      return aDate.localeCompare(bDate);
    });
    
    // 날짜별로 그룹화
    const groupedByDate = sortedData.reduce((acc: any, item: any) => {
      const dateKey = item.date || item.week || item.month;
      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }
      acc[dateKey][item.emotion_id] = item.count;
      return acc;
    }, {});
    
    // 일일 합계 계산
    const dateLabels = Object.keys(groupedByDate);
    const datasets = emotions.slice(0, 3).map(emotion => {
      const data = dateLabels.map(dateKey => 
        groupedByDate[dateKey][emotion.emotion_id] || 0
      );
      
      return {
        data,
        color: () => emotion.color,
        strokeWidth: 2
      };
    });
    
    return {
      labels: dateLabels.map(dateKey => {
        if (period === 'daily') {
          // 마지막 5자리만 표시 (MM-DD)
          return dateKey.substring(5);
        } else if (period === 'weekly') {
          // W 이후의 주차만 표시
          return dateKey.split('-W')[1] + '주';
        } else {
          // 연도-월 형식 중 월만 표시
          return dateKey.substring(5) + '월';
        }
      }),
      datasets
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const pieChartData = preparePieChartData();
  const lineChartData = prepareLineChartData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>감정 통계</Text>
      </View>

      <SegmentedButtons
        value={period}
        onValueChange={(value) => setPeriod(value as PeriodType)}
        buttons={[
          { value: 'daily', label: '일간' },
          { value: 'weekly', label: '주간' },
          { value: 'monthly', label: '월간' }
        ]}
        style={styles.periodSelector}
      />

      <ScrollView>
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle} testID="period-label">{getPeriodLabel()}</Text>
            
            {pieChartData.length > 0 ? (
              <View style={styles.chartContainer} testID="emotion-chart">
                <PieChart
                  data={pieChartData}
                  width={Dimensions.get('window').width - 64}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="count"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <Text style={styles.noDataText}>데이터가 없습니다</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>기간별 감정 추이</Text>
            
            {lineChartData.labels.length > 0 ? (
              <LineChart
                data={lineChartData}
                width={Dimensions.get('window').width - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.lineChart}
              />
            ) : (
              <Text style={styles.noDataText}>데이터가 없습니다</Text>
            )}
            
            <View style={styles.legendContainer}>
              {emotions.slice(0, 3).map(emotion => (
                <View key={emotion.emotion_id} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: emotion.color }]} />
                  <Text style={styles.legendText}>{emotion.name}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>감정 요약</Text>
            
            <View style={styles.emotionSummary}>
              {pieChartData.map((item, index) => (
                <Chip
                  key={index}
                  icon={() => (
                    <MaterialCommunityIcons
                      name={getEmotionIcon(emotions.find(e => e.name === item.name)?.emotion_id) as any}
                      size={16}
                      color={item.color}
                    />
                  )}
                  style={[styles.emotionChip, { backgroundColor: item.color + '20' }]}
                >
                  {item.name} ({item.count}회)
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>

    // src/screens/StatisticsScreen.tsx (계속)
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  periodSelector: {
    margin: 16,
  },
  chartCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 24,
    elevation: 2,
  },
  emotionSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emotionChip: {
    margin: 4,
  },
});

export default StatisticsScreen;