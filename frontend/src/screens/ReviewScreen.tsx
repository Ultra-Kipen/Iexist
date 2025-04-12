import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import {
    SegmentedButtons,
    Card,
    Button,
    Title,
    Paragraph,
    useTheme
} from 'react-native-paper';

const ReviewScreen = () => {
    const [period, setPeriod] = useState('weekly');
    const theme = useTheme();

    return (
        <ScrollView style={styles.container}>
            <SegmentedButtons
                value={period}
                onValueChange={setPeriod}
                buttons={[
                    { value: 'weekly', label: '주간' },
                    { value: 'monthly', label: '월간' },
                ]}
                style={styles.segmentedButtons}
            />

            <Title style={styles.title}>나의 {period === 'weekly' ? '주간' : '월간'} 기록</Title>

            <View style={styles.imageGrid}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Card key={item} style={styles.imageCard}>
                        <Card.Cover source={{ uri: `https://picsum.photos/300?random=${item}` }} />
                    </Card>
                ))}
            </View>

            <Button
                mode="contained"
                onPress={() => console.log('Show emotion graph')}
                style={styles.graphButton}
            >
                감정 변화 그래프 보기
            </Button>

            <Card style={styles.statsCard}>
                <Card.Content>
                    <Title>이번 {period === 'weekly' ? '주' : '달'}의 통계</Title>
                    <Paragraph>가장 많이 느낀 감정: 행복</Paragraph>
                    <Paragraph>게시물 수: 7개</Paragraph>
                    <Paragraph>받은 공감: 23개</Paragraph>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    segmentedButtons: {
        marginBottom: 16,
    },
    title: {
        marginBottom: 16,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    imageCard: {
        width: '48%',
        marginBottom: 16,
    },
    graphButton: {
        marginVertical: 16,
    },
    statsCard: {
        marginBottom: 16,
    },
});

export default ReviewScreen;