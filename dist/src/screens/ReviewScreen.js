"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_paper_1 = require("react-native-paper");
const ReviewScreen = () => {
    const [period, setPeriod] = (0, react_1.useState)('weekly');
    const theme = (0, react_native_paper_1.useTheme)();
    return (<react_native_1.ScrollView style={styles.container}>
            <react_native_paper_1.SegmentedButtons value={period} onValueChange={setPeriod} buttons={[
            { value: 'weekly', label: '주간' },
            { value: 'monthly', label: '월간' },
        ]} style={styles.segmentedButtons}/>

            <react_native_paper_1.Title style={styles.title}>나의 {period === 'weekly' ? '주간' : '월간'} 기록</react_native_paper_1.Title>

            <react_native_1.View style={styles.imageGrid}>
                {[1, 2, 3, 4, 5, 6].map((item) => (<react_native_paper_1.Card key={item} style={styles.imageCard}>
                        <react_native_paper_1.Card.Cover source={{ uri: `https://picsum.photos/300?random=${item}` }}/>
                    </react_native_paper_1.Card>))}
            </react_native_1.View>

            <react_native_paper_1.Button mode="contained" onPress={() => console.log('Show emotion graph')} style={styles.graphButton}>
                감정 변화 그래프 보기
            </react_native_paper_1.Button>

            <react_native_paper_1.Card style={styles.statsCard}>
                <react_native_paper_1.Card.Content>
                    <react_native_paper_1.Title>이번 {period === 'weekly' ? '주' : '달'}의 통계</react_native_paper_1.Title>
                    <react_native_paper_1.Paragraph>가장 많이 느낀 감정: 행복</react_native_paper_1.Paragraph>
                    <react_native_paper_1.Paragraph>게시물 수: 7개</react_native_paper_1.Paragraph>
                    <react_native_paper_1.Paragraph>받은 공감: 23개</react_native_paper_1.Paragraph>
                </react_native_paper_1.Card.Content>
            </react_native_paper_1.Card>
        </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
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
exports.default = ReviewScreen;
