import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onTyping,
  placeholder = 'Type a message...',
  maxLength = 1000,
  disabled = false,
}: MessageInputProps) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const border = `${text}15`;

  const [inputText, setInputText] = useState('');

  const handleTextChange = (newText: string) => {
    setInputText(newText);
    
    // Trigger typing indicator when user types
    if (onTyping && newText.length > 0) {
      onTyping();
    }
  };

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (trimmedText.length === 0 || disabled) return;

    onSend(trimmedText);
    setInputText('');
  };

  const canSend = inputText.trim().length > 0 && !disabled;

  return (
    <View style={[styles.inputContainer, { borderTopColor: border }]}>
      <View style={[styles.inputWrapper, { backgroundColor: `${text}0A`, borderColor: border }]}>
        <TextInput
          style={[styles.input, { color: text }]}
          placeholder={placeholder}
          placeholderTextColor={`${text}50`}
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          maxLength={maxLength}
          editable={!disabled}
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? tint : `${text}20` },
          ]}
        >
          <Feather name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
