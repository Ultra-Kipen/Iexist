import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import {
    Text,
    Button,
    Chip,
    useTheme,
    TextInput,
    Card,
    Avatar,
    IconButton,
    FAB,
    Divider,
    Surface
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Emotion = {
    label: string;
    icon: string;
};

type Comment = {
    id: number;
    author: string;
    content: string;
};

type Post = {
    id: number;
    anonymousId: string;
    content: string;
    emotion: string;
    emotionIcon: string;
    image: string;
    likes: number;
    comments: Comment[];
    timestamp: string;
};

const emotions: Emotion[] = [
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
    const theme = useTheme();
    const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
    const [postContent, setPostContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [posts, setPosts] = useState<Post[]>([
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
            const newPost: Post = {
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

    const handleLike = (postId: number) => {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ));
    };
    const handleComment = (postId: number, commentContent: string) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? {
                    ...post,
                    comments: [
                        ...post.comments,
                        {
                            id: Date.now(),
                            author: '익명',
                            content: commentContent
                        }
                    ]
                }
                : post
        ));
    };
    return (
        <View style={styles.container}>
        <ScrollView style={styles.content}>
            <View style={styles.emotionSelector}>
                {emotions.map((emotion) => (
                    <Chip
                        key={emotion.label}
                        mode={selectedEmotion === emotion ? 'flat' : 'outlined'}
                        selected={selectedEmotion === emotion}
                        onPress={() => setSelectedEmotion(emotion)}
                        style={styles.emotionChip}
                        textStyle={styles.emotionChipText}
                        avatar={
                            <Icon 
                                name={emotion.icon} 
                                size={20} 
                                color={selectedEmotion === emotion ? theme.colors.primary : theme.colors.text}
                            />
                        }
                    >
                        {emotion.label}
                    </Chip>
                ))}
            </View>
                <Card style={styles.inputCard}>
                    <Card.Content>
                        <TextInput
                            value={postContent}
                            onChangeText={setPostContent}
                            placeholder="나의 오늘은..."
                            multiline
                            numberOfLines={4}
                            style={styles.postInput}
                        />
                        <Button
                            icon="camera"
                            mode="outlined"
                            onPress={handleImageUpload}
                            style={styles.imageButton}
                        >
                            사진 추가
                        </Button>
                        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />}
                    </Card.Content>
                    <Card.Actions>
                        <Button
                            mode="contained"
                            onPress={handlePost}
                            style={styles.postButton}
                        >
                            나의 하루 공유하기
                        </Button>
                    </Card.Actions>
                </Card>

                <Text style={styles.sectionTitle}>누군가의 하루는..</Text>
                {posts.map((post) => (
                    <Card key={post.id} style={styles.postCard}>
                        <Card.Title
                            title={post.anonymousId}
                            subtitle={post.timestamp}
                            left={(props) => <Avatar.Icon {...props} icon="account" />}
                            right={(props) => (
                                <IconButton {...props} icon="dots-vertical" onPress={() => { }} />
                            )}
                        />
                        <Card.Content>
                            <Text style={styles.postContent}>{post.content}</Text>
                            <View style={styles.emotionContainer}>
                                <Text style={styles.emotionIcon}>{post.emotionIcon}</Text>
                                <Chip style={styles.emotionChip}>{post.emotion}</Chip>
                            </View>
                            {post.image && (
                                <Image source={{ uri: post.image }} style={styles.postImage} />
                            )}
                        </Card.Content>
                        <Card.Actions>
                            <IconButton
                                icon="heart-outline"
                                onPress={() => handleLike(post.id)}
                                color={theme.colors.primary}
                            />
                            <Text>{post.likes}</Text>
                            <IconButton
                                icon="comment-outline"
                                onPress={() => { }}
                                color={theme.colors.primary}
                            />
                            <Text>{post.comments.length}</Text>
                        </Card.Actions>
                        <Divider />
                        <Card.Content>
                            {post.comments.map((comment) => (
                                <View key={comment.id} style={styles.commentContainer}>
                                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                                    <Text>{comment.content}</Text>
                                </View>
                            ))}
                            <TextInput
                                placeholder="따뜻한 말 한마디..."
                                right={<TextInput.Icon icon="send" onPress={() => handleComment(post.id, '새 댓글')} />}
                            />
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => console.log('FAB Pressed')}
            />
        </View>
    );
};
const styles = StyleSheet.create({
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

export default HomeScreen;