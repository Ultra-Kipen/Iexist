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
const ComfortScreen = () => {
    const [concern, setConcern] = (0, react_1.useState)('');
    const theme = (0, react_native_paper_1.useTheme)();
    const handlePost = () => {
        console.log('Posting concern:', concern);
        setConcern('');
        // Here you would typically send the concern to your backend
    };
    return (<react_native_1.View style={styles.container}>
            <react_native_1.ScrollView style={styles.scrollView}>
                <react_native_paper_1.Card style={styles.card}>
                    <react_native_paper_1.Card.Content>
                        <react_native_paper_1.Title>익명으로 고민을 나눠보세요</react_native_paper_1.Title>
                        <react_native_paper_1.TextInput mode="outlined" label="고민 내용" value={concern} onChangeText={setConcern} multiline numberOfLines={4} style={styles.input}/>
                        <react_native_paper_1.Button mode="contained" onPress={handlePost} style={styles.button}>
                            게시하기
                        </react_native_paper_1.Button>
                    </react_native_paper_1.Card.Content>
                </react_native_paper_1.Card>

                <react_native_paper_1.Title style={styles.title}>다른 사용자들의 고민</react_native_paper_1.Title>
                <react_native_paper_1.List.Section>
                    <react_native_paper_1.List.Item title="요즘 너무 외로워요.." description="댓글 3개" left={props => <react_native_paper_1.List.Icon {...props} icon="comment-outline"/>} onPress={() => console.log('Open comments')}/>
                    <react_native_paper_1.List.Item title="일이 너무 힘들어요. 어떻게 해야 할까요?" description="댓글 5개" left={props => <react_native_paper_1.List.Icon {...props} icon="comment-outline"/>} onPress={() => console.log('Open comments')}/>
                </react_native_paper_1.List.Section>
            </react_native_1.ScrollView>
            <react_native_paper_1.FAB style={[styles.fab, { backgroundColor: theme.colors.primary }]} icon="plus" onPress={() => console.log('Add new concern')}/>
        </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        margin: 16,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
    title: {
        marginLeft: 16,
        marginTop: 24,
        marginBottom: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
exports.default = ComfortScreen;
