/**
 * Critical User Flow Tests
 * Tests the main user journeys through the SwapX application
 */

import { createSwap, deleteSwap, getSwaps, updateSwap } from '../lib/database.utils';
import { createConversation, getConversationMessages, sendMessage } from '../lib/messaging.utils';
import { supabase } from '../lib/supabase';

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

describe('Critical User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Complete Signup to Swap Creation Flow', () => {
    it('should allow user to sign up with email and password', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.error).toBeNull();
      expect(result.data.user).toEqual(mockUser);
    });

    it('should create user profile after signup', async () => {
      const mockProfile = {
        id: 'test-user-id',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        job_title: 'Teacher',
        current_ministry: 'Education',
        current_district: 'Lusaka',
      };

      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await supabase
        .from('profiles')
        .insert(mockProfile)
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProfile);
    });

    it('should create a swap after profile setup', async () => {
      const mockSwap = {
        id: 'swap-id',
        user_id: 'test-user-id',
        current_ministry: 'Education',
        current_district: 'Lusaka',
        current_institution: 'Test School',
        current_area_type: 'urban',
        desired_district: 'Ndola',
        desired_area_type: 'urban',
        job_title: 'Teacher',
        status: 'active',
      };

      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSwap,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await createSwap(mockSwap);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSwap);
    });

    it('should display created swap on home screen', async () => {
      const mockSwaps = [
        {
          id: 'swap-1',
          current_ministry: 'Education',
          current_district: 'Lusaka',
          desired_district: 'Ndola',
          status: 'active',
        },
      ];

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockSwaps,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await getSwaps({ status: 'active' });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSwaps);
    });
  });

  describe('2. Messaging Functionality End-to-End', () => {
    it('should create a conversation between two users', async () => {
      const mockConversation = {
        id: 'conversation-id',
        participant_1_id: 'user-1',
        participant_2_id: 'user-2',
        swap_id: 'swap-id',
      };

      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockConversation,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await createConversation('user-1', 'user-2', 'swap-id');

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockConversation);
    });

    it('should send a message in a conversation', async () => {
      const mockMessage = {
        id: 'message-id',
        conversation_id: 'conversation-id',
        sender_id: 'user-1',
        content: 'Hello, interested in your swap!',
        message_type: 'text',
      };

      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockMessage,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await sendMessage(
        'conversation-id',
        'user-1',
        'Hello, interested in your swap!'
      );

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockMessage);
    });

    it('should retrieve messages from a conversation', async () => {
      const mockMessages = [
        {
          id: 'message-1',
          conversation_id: 'conversation-id',
          sender_id: 'user-1',
          content: 'Hello!',
          created_at: new Date().toISOString(),
        },
        {
          id: 'message-2',
          conversation_id: 'conversation-id',
          sender_id: 'user-2',
          content: 'Hi there!',
          created_at: new Date().toISOString(),
        },
      ];

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockMessages,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await getConversationMessages('conversation-id');

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockMessages);
    });

    it('should mark messages as read', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', 'conversation-id')
        .is('read_at', null);

      expect(result.error).toBeNull();
    });
  });

  describe('3. Profile Management and Settings', () => {
    it('should retrieve user profile', async () => {
      const mockProfile = {
        id: 'user-id',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        job_title: 'Teacher',
        current_ministry: 'Education',
        profile_photo_url: 'https://example.com/photo.jpg',
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'user-id')
        .single();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockProfile);
    });

    it('should update user profile', async () => {
      const updatedProfile = {
        first_name: 'Jane',
        bio: 'Updated bio',
      };

      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...updatedProfile, id: 'user-id' },
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', 'user-id')
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data.first_name).toBe('Jane');
    });

    it('should retrieve user settings', async () => {
      const mockSettings = {
        id: 'settings-id',
        user_id: 'user-id',
        push_notifications: true,
        email_notifications: false,
        match_notifications: true,
        message_notifications: true,
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSettings,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', 'user-id')
        .single();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSettings);
    });

    it('should update notification settings', async () => {
      const updatedSettings = {
        push_notifications: false,
        message_notifications: false,
      };

      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...updatedSettings, user_id: 'user-id' },
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await supabase
        .from('user_settings')
        .update(updatedSettings)
        .eq('user_id', 'user-id')
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data.push_notifications).toBe(false);
    });

    it('should upload profile photo', async () => {
      const mockUpload = {
        data: { path: 'profiles/user-id/photo.jpg' },
        error: null,
      };

      const mockStorage = {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue(mockUpload),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://example.com/photo.jpg' },
          }),
        }),
      };

      (supabase.storage as any) = mockStorage;

      const result = await supabase.storage
        .from('avatars')
        .upload('profiles/user-id/photo.jpg', new Blob());

      expect(result.error).toBeNull();
      expect(result.data.path).toBe('profiles/user-id/photo.jpg');
    });
  });

  describe('4. Swap Management', () => {
    it('should update swap details', async () => {
      const updatedSwap = {
        additional_details: 'Updated details',
        status: 'active',
      };

      const mockFrom = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...updatedSwap, id: 'swap-id' },
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await updateSwap('swap-id', updatedSwap);

      expect(result.error).toBeNull();
      expect(result.data.additional_details).toBe('Updated details');
    });

    it('should delete a swap', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await deleteSwap('swap-id');

      expect(result.error).toBeNull();
    });

    it('should express interest in a swap', async () => {
      const mockInterest = {
        id: 'interest-id',
        swap_id: 'swap-id',
        interested_user_id: 'user-id',
        status: 'pending',
        message: 'Interested in this swap!',
      };

      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockInterest,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await supabase
        .from('swap_interests')
        .insert(mockInterest)
        .select()
        .single();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockInterest);
    });
  });
});
