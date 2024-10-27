"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_paper_1 = require("react-native-paper");
const challenges = [
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
    const theme = (0, react_native_paper_1.useTheme)();
    const handleJoinChallenge = (challengeId) => {
        console.log('Joining challenge:', challengeId);
        // Here you would typically send a request to join the challenge
    };
    return (<react_native_1.ScrollView style={styles.container}>
            <react_native_paper_1.Title style={styles.title}>현재 진행 중인 챌린지</react_native_paper_1.Title>
            {challenges.map((challenge) => (<react_native_paper_1.Card key={challenge.id} style={styles.card}>
                    <react_native_paper_1.Card.Content>
                        <react_native_paper_1.Title>{challenge.title}</react_native_paper_1.Title>
                        <react_native_paper_1.Paragraph>{challenge.description}</react_native_paper_1.Paragraph>
                        <react_native_1.View style={styles.progressContainer}>
                            <react_native_paper_1.ProgressBar progress={challenge.progress} color={theme.colors.primary} style={styles.progressBar}/>
                            <react_native_paper_1.Paragraph>{`${Math.round(challenge.progress * 100)}% 완료`}</react_native_paper_1.Paragraph>
                        </react_native_1.View>
                        <react_native_paper_1.List.Item title={`참여자: ${challenge.participants}명`} left={props => <react_native_paper_1.List.Icon {...props} icon="account-group"/>}/>
                        <react_native_paper_1.List.Item title={`기간: ${challenge.duration}일`} left={props => <react_native_paper_1.List.Icon {...props} icon="calendar-range"/>}/>
                    </react_native_paper_1.Card.Content>
                    <react_native_paper_1.Card.Actions>
                        <react_native_paper_1.Button onPress={() => handleJoinChallenge(challenge.id)}>참여하기</react_native_paper_1.Button>
                    </react_native_paper_1.Card.Actions>
                </react_native_paper_1.Card>))}
        </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
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
exports.default = ChallengeScreen;
