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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_paper_1 = require("react-native-paper");
const MaterialCommunityIcons_1 = __importDefault(require("react-native-vector-icons/MaterialCommunityIcons"));
const emotions = [
    { label: '행복', icon: 'emoticon-happy-outline' },
    { label: '감사', icon: 'hand-heart' },
    { label: '위로', icon: 'hand-peace' },
    { label: '감동', icon: 'heart-outline' },
    { label: '슬픔', icon: 'emoticon-sad-outline' },
    { label: '불안', icon: 'alert-outline' },
    { label: '화남', icon: 'emoticon-angry-outline' },
    { label: '지침', icon: 'emoticon-neutral-outline' },
    { label: '우울', icon: 'weather-cloudy' },
    { label: '고독', icon: 'account-outline' },
    { label: '충격', icon: 'lightning-bolt' },
    { label: '편함', icon: 'sofa-outline' }
];
const HomeScreen = () => {
    const theme = (0, react_native_paper_1.useTheme)();
    const [selectedEmotion, setSelectedEmotion] = (0, react_1.useState)(null);
    const [postContent, setPostContent] = (0, react_1.useState)('');
    const [imageUrl, setImageUrl] = (0, react_1.useState)('');
    const [posts, setPosts] = (0, react_1.useState)([
        {
            id: 1,
            anonymousId: '익명1',
            content: '오늘도 난 여기 존재하고 있어요. 작은 일상이 감사하네요.',
            emotion: '감사',
            emotionIcon: '🙏',
            image: 'https://via.placeholder.com/150',
            likes: 15,
            comments: [
                { id: 1, author: '익명2', content: '당신의 존재 자체가 소중해요. 힘내세요!' },
                { id: 2, author: '익명3', content: '저도 같은 마음이에요. 함께 이겨내요.' }
            ],
            timestamp: '2시간 전'
        },
        {
            id: 2,
            anonymousId: '익명4',
            content: '힘든 날이지만, 그래도 난 여기 있어요. 누군가 내 마음을 알아줬으면 좋겠어요.',
            emotion: '위로',
            emotionIcon: '🤗',
            image: 'https://via.placeholder.com/150',
            likes: 23,
            comments: [
                { id: 1, author: '익명5', content: '당신의 마음 잘 알겠어요. 함께 있어 줄게요.' },
            ],
            timestamp: '4시간 전'
        },
    ]);
    // handlePost, handleImageUpload, handleLike, handleComment 함수들은 그대로 유지
    const handlePost = () => {
        if (postContent && selectedEmotion) {
            const newPost = {
                id: Date.now(),
                anonymousId: `익명${posts.length + 1}`,
                content: postContent,
                emotion: selectedEmotion.label,
                emotionIcon: selectedEmotion.icon,
                image: imageUrl,
                likes: 0,
                comments: [],
                timestamp: '방금 전'
            };
            setPosts([newPost, ...posts]);
            setPostContent('');
            setSelectedEmotion(null);
            setImageUrl('');
        }
    };
    const handleImageUpload = () => {
        // 실제 이미지 업로드 로직을 여기에 구현해야 합니다.
        // 지금은 임시로 더미 URL을 설정합니다.
        setImageUrl('https://via.placeholder.com/150');
        console.log('이미지 업로드 기능이 호출되었습니다.');
    };
    const handleLike = (postId) => {
        setPosts(posts.map(post => post.id === postId ? Object.assign(Object.assign({}, post), { likes: post.likes + 1 }) : post));
    };
    const handleComment = (postId, commentContent) => {
        setPosts(posts.map(post => post.id === postId
            ? Object.assign(Object.assign({}, post), { comments: [
                    ...post.comments,
                    {
                        id: Date.now(),
                        author: '익명',
                        content: commentContent
                    }
                ] }) : post));
    };
    return (<react_native_1.View style={styles.container}>
        <react_native_1.ScrollView style={styles.content}>
            <react_native_1.View style={styles.emotionSelector}>
                {emotions.map((emotion) => (<react_native_paper_1.Chip key={emotion.label} mode={selectedEmotion === emotion ? 'flat' : 'outlined'} selected={selectedEmotion === emotion} onPress={() => setSelectedEmotion(emotion)} style={styles.emotionChip} textStyle={styles.emotionChipText} avatar={<MaterialCommunityIcons_1.default name={emotion.icon} size={20} color={selectedEmotion === emotion ? theme.colors.primary : theme.colors.text}/>}>
                        {emotion.label}
                    </react_native_paper_1.Chip>))}
            </react_native_1.View>
                <react_native_paper_1.Card style={styles.inputCard}>
                    <react_native_paper_1.Card.Content>
                        <react_native_paper_1.TextInput value={postContent} onChangeText={setPostContent} placeholder="나의 오늘은..." multiline numberOfLines={4} style={styles.postInput}/>
                        <react_native_paper_1.Button icon="camera" mode="outlined" onPress={handleImageUpload} style={styles.imageButton}>
                            사진 추가
                        </react_native_paper_1.Button>
                        {imageUrl && <react_native_1.Image source={{ uri: imageUrl }} style={styles.uploadedImage}/>}
                    </react_native_paper_1.Card.Content>
                    <react_native_paper_1.Card.Actions>
                        <react_native_paper_1.Button mode="contained" onPress={handlePost} style={styles.postButton}>
                            나의 하루 공유하기
                        </react_native_paper_1.Button>
                    </react_native_paper_1.Card.Actions>
                </react_native_paper_1.Card>

                <react_native_paper_1.Text style={styles.sectionTitle}>누군가의 하루는..</react_native_paper_1.Text>
                {posts.map((post) => (<react_native_paper_1.Card key={post.id} style={styles.postCard}>
                        <react_native_paper_1.Card.Title title={post.anonymousId} subtitle={post.timestamp} left={(props) => <react_native_paper_1.Avatar.Icon {...props} icon="account"/>} right={(props) => (<react_native_paper_1.IconButton {...props} icon="dots-vertical" onPress={() => { }}/>)}/>
                        <react_native_paper_1.Card.Content>
                            <react_native_paper_1.Text style={styles.postContent}>{post.content}</react_native_paper_1.Text>
                            <react_native_1.View style={styles.emotionContainer}>
                                <react_native_paper_1.Text style={styles.emotionIcon}>{post.emotionIcon}</react_native_paper_1.Text>
                                <react_native_paper_1.Chip style={styles.emotionChip}>{post.emotion}</react_native_paper_1.Chip>
                            </react_native_1.View>
                            {post.image && (<react_native_1.Image source={{ uri: post.image }} style={styles.postImage}/>)}
                        </react_native_paper_1.Card.Content>
                        <react_native_paper_1.Card.Actions>
                            <react_native_paper_1.IconButton icon="heart-outline" onPress={() => handleLike(post.id)} color={theme.colors.primary}/>
                            <react_native_paper_1.Text>{post.likes}</react_native_paper_1.Text>
                            <react_native_paper_1.IconButton icon="comment-outline" onPress={() => { }} color={theme.colors.primary}/>
                            <react_native_paper_1.Text>{post.comments.length}</react_native_paper_1.Text>
                        </react_native_paper_1.Card.Actions>
                        <react_native_paper_1.Divider />
                        <react_native_paper_1.Card.Content>
                            {post.comments.map((comment) => (<react_native_1.View key={comment.id} style={styles.commentContainer}>
                                    <react_native_paper_1.Text style={styles.commentAuthor}>{comment.author}</react_native_paper_1.Text>
                                    <react_native_paper_1.Text>{comment.content}</react_native_paper_1.Text>
                                </react_native_1.View>))}
                            <react_native_paper_1.TextInput placeholder="따뜻한 말 한마디..." right={<react_native_paper_1.TextInput.Icon icon="send" onPress={() => handleComment(post.id, '새 댓글')}/>}/>
                        </react_native_paper_1.Card.Content>
                    </react_native_paper_1.Card>))}
            </react_native_1.ScrollView>
            <react_native_paper_1.FAB style={styles.fab} icon="plus" onPress={() => console.log('FAB Pressed')}/>
        </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0e6ff', // 연한 보라색 배경
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emotionSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    emotionChip: {
        width: '23%',
        marginBottom: 10,
    },
    emotionChipText: {
        fontSize: 12,
    },
    emotionIcon: {
        fontSize: 16,
    },
    inputCard: {
        marginBottom: 20,
        elevation: 4,
    },
    postInput: {
        backgroundColor: 'transparent',
        marginBottom: 10,
    },
    imageButton: {
        marginBottom: 10,
    },
    uploadedImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 10,
    },
    postButton: {
        width: '100%',
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 16,
    },
    postCard: {
        marginBottom: 16,
    },
    postContent: {
        fontSize: 14,
        marginBottom: 8,
    },
    emotionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 8,
    },
    commentContainer: {
        marginVertical: 4,
    },
    commentAuthor: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
exports.default = HomeScreen;
