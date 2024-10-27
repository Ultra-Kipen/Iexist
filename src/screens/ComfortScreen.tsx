import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
    Card,
    TextInput,
    Button,
    List,
    Title,
    Paragraph,
    useTheme,
    FAB
} from 'react-native-paper';

const ComfortScreen = () => {
    const [concern, setConcern] = useState('');
    const theme = useTheme();

    const handlePost = () => {
        console.log('Posting concern:', concern);
        setConcern('');
        // Here you would typically send the concern to your backend
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>익명으로 고민을 나눠보세요</Title>
                        <TextInput
                            mode="outlined"
                            label="고민 내용"
                            value={concern}
                            onChangeText={setConcern}
                            multiline
                            numberOfLines={4}
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={handlePost} style={styles.button}>
                            게시하기
                        </Button>
                    </Card.Content>
                </Card>

                <Title style={styles.title}>다른 사용자들의 고민</Title>
                <List.Section>
                    <List.Item
                        title="요즘 너무 외로워요.."
                        description="댓글 3개"
                        left={props => <List.Icon {...props} icon="comment-outline" />}
                        onPress={() => console.log('Open comments')}
                    />
                    <List.Item
                        title="일이 너무 힘들어요. 어떻게 해야 할까요?"
                        description="댓글 5개"
                        left={props => <List.Icon {...props} icon="comment-outline" />}
                        onPress={() => console.log('Open comments')}
                    />
                </List.Section>
            </ScrollView>
            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                icon="plus"
                onPress={() => console.log('Add new concern')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
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

export default ComfortScreen;