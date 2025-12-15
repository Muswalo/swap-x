import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { MessageWithSender } from '@/lib/database.types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface MessageBubbleProps {
  message: MessageWithSender;
  isCurrentUser: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isCurrentUser, showAvatar }: MessageBubbleProps) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    if (message.read_at) {
      return '✓✓'; // Read
    }
    return '✓'; // Delivered
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.messageContainerRight : styles.messageContainerLeft,
      ]}
    >
      {!isCurrentUser && (
        <View style={styles.avatarSpace}>
          {showAvatar && message.sender.profile_photo_url && (
            <Image
              source={{ uri: message.sender.profile_photo_url }}
              style={styles.messageAvatar}
            />
          )}
          {showAvatar && !message.sender.profile_photo_url && (
            <View style={[styles.messageAvatar, { backgroundColor: tint }]}>
              <ThemedText style={styles.avatarText}>
                {message.sender.first_name?.[0] || '?'}
              </ThemedText>
            </View>
          )}
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? { backgroundColor: tint } : { backgroundColor: `${text}0A` },
          message.message_type === 'system' && styles.systemMessage,
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            isCurrentUser && { color: '#FFFFFF' },
            message.message_type === 'system' && styles.systemMessageText,
          ]}
        >
          {message.content}
        </ThemedText>
        <View style={styles.messageFooter}>
          <ThemedText
            style={[
              styles.messageTime,
              isCurrentUser ? { color: '#FFFFFF99' } : { color: `${text}77` },
            ]}
          >
            {formatTime(message.created_at)}
          </ThemedText>
          {isCurrentUser && (
            <ThemedText
              style={[styles.messageStatus, { color: '#FFFFFF99' }]}
            >
              {getStatusIcon()}
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageContainerLeft: {
    justifyContent: 'flex-start',
  },
  messageContainerRight: {
    justifyContent: 'flex-end',
  },
  avatarSpace: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  systemMessage: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  systemMessageText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  messageStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
});
