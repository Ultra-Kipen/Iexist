import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Card,
    Title,
    Paragraph,
    Button,
    ProgressBar,
    useTheme,
    List
} from 'react-native-paper';

interface Challenge {
    id: number;
    title: string;
    description: string;
    participants: number;
    duration: number;
    progress: number;
}

const challenges: Challenge[] = [
    {
        id: 1,
        title: '7일간의 감사 일기',
        description: '매일 감사한 일 3가지를 기록해보세요.',
        participants: 128,
        duration: 7,
        progress: 0.4,
    },
    {
        id: 2,
        title: '30일 긍정 에너지 나누기',
        description: '하루에 한 번 주변 사람에게 긍정적인 말을 해보세요.',
        participants: 56,
        duration: 30,
        progress: 0.2,
    },
    {
        id: 3,
        title: '21일 명상 습관 만들기',
        description: '매일 10분씩 명상을 하고 느낀 점을 공유해보세요.',
        participants: 89,
        duration: 21,
        progress: 0.6,
    },
];

const ChallengeScreen = () => {
    const theme = useTheme();

    const handleJoinChallenge = (challengeId: number) => {
        console.log('Joining challenge:', challengeId);
        // Here you would typically send a request to join the challenge
    };

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.title}>현재 진행 중인 챌린지</Title>
            {challenges.map((challenge) => (
                <Card key={challenge.id} style={styles.card}>
                    <Card.Content>
                        <Title>{challenge.title}</Title>
                        <Paragraph>{challenge.description}</Paragraph>
                        <View style={styles.progressContainer}>
                            <ProgressBar progress={challenge.progress} color={theme.colors.primary} style={styles.progressBar} />
                            <Paragraph>{`${Math.round(challenge.progress * 100)}% 완료`}</Paragraph>
                        </View>
                        <List.Item
                            title={`참여자: ${challenge.participants}명`}
                            left={props => <List.Icon {...props} icon="account-group" />}
                        />
                        <List.Item
                            title={`기간: ${challenge.duration}일`}
                            left={props => <List.Icon {...props} icon="calendar-range" />}
                        />
                    </Card.Content>
                    <Card.Actions>
                        <Button onPress={() => handleJoinChallenge(challenge.id)}>참여하기</Button>
                    </Card.Actions>
                </Card>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        marginBottom: 16,
    },
    card: {
        marginBottom: 16,
    },
    progressContainer: {
        marginVertical: 8,
    },
    progressBar: {
        marginVertical: 4,
    },
});

export default ChallengeScreen;