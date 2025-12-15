import { AppButton } from '@/components/app-button';
import { BottomModal } from '@/components/bottom-modal';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Tables } from '@/lib/database.types';
import { swapUtils } from '@/lib/database.utils';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Swap = Tables<'swaps'>;

type ConfirmModalState = {
  visible: boolean;
  type: 'delete' | 'toggle' | null;
  swapId: string | null;
  currentStatus?: string;
};

export default function MySwapsScreen() {
  const router = useRouter();
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const subtleText = `${text}80`;
  const borderCol = `${text}15`;

  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({});
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    visible: false,
    type: null,
    swapId: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadSwaps();
    }, [])
  );

  const loadSwaps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userSwaps = await swapUtils.getUserSwaps(user.id);
      setSwaps(userSwaps);

      // Load interest counts for each swap
      const counts: Record<string, number> = {};
      for (const swap of userSwaps) {
        const { count } = await supabase
          .from('swap_interests')
          .select('*', { count: 'exact', head: true })
          .eq('swap_id', swap.id);
        counts[swap.id] = count || 0;
      }
      setInterestCounts(counts);
    } catch (error) {
      console.error('Error loading swaps:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSwaps();
  };

  const handleEditSwap = (swapId: string) => {
    router.push({
      pathname: '/edit-swap',
      params: { swapId },
    });
  };

  const handleDeleteSwap = (swapId: string) => {
    setConfirmModal({
      visible: true,
      type: 'delete',
      swapId,
    });
  };

  const handleToggleStatus = (swapId: string, currentStatus: string) => {
    setConfirmModal({
      visible: true,
      type: 'toggle',
      swapId,
      currentStatus,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ visible: false, type: null, swapId: null });
  };

  const confirmAction = async () => {
    if (!confirmModal.swapId) return;
    
    setIsProcessing(true);
    try {
      if (confirmModal.type === 'delete') {
        const success = await swapUtils.deleteSwap(confirmModal.swapId);
        if (success) {
          await loadSwaps();
        }
      } else if (confirmModal.type === 'toggle') {
        const newStatus = confirmModal.currentStatus === 'active' ? 'paused' : 'active';
        await swapUtils.updateSwapStatus(confirmModal.swapId, newStatus as any);
        await loadSwaps();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
      closeConfirmModal();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981'; // Green
      case 'paused':
        return '#F59E0B'; // Yellow/Amber
      case 'completed':
        return '#3B82F6'; // Blue
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'trending-up';
      case 'paused':
        return 'pause';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'x-octagon';
      default:
        return 'circle';
    }
  };

  const SwapCard = ({ swap }: { swap: Swap }) => {
    const statusColor = getStatusColor(swap.status || 'active');
    const statusIcon = getStatusIcon(swap.status || 'active');
    const interestCount = interestCounts[swap.id] || 0;
    const isPaused = swap.status === 'paused';

    return (
      <View style={[styles.swapItem, { borderColor: borderCol, opacity: isPaused ? 0.8 : 1 }]}>
        
        {/* TOP: Status and Interests (Stats Header) */}
        <View style={styles.statHeader}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Feather
              name={statusIcon as any}
              size={14}
              color={statusColor}
            />
            <ThemedText style={[styles.statusText, { color: statusColor }]}>
              {(swap.status || 'active').charAt(0).toUpperCase() + (swap.status || 'active').slice(1)}
            </ThemedText>
          </View>
          
          {/* Interest Count */}
          {interestCount > 0 && (
            <Pressable
              onPress={() => router.push({
                pathname: '/swap-interests',
                params: { swapId: swap.id }
              })}
              style={({ pressed }) => [
                styles.interestBadge,
                { backgroundColor: `${tint}15`, opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Feather name="users" size={14} color={tint} />
              <ThemedText style={[styles.interestCount, { color: tint }]}>
                {interestCount} Interested
              </ThemedText>
            </Pressable>
          )}
        </View>

        {/* MIDDLE: Swap Route (Primary Info) */}
        <View style={styles.swapRoute}>
          {/* Current Location */}
          <View style={styles.routeBlock}>
            <ThemedText style={[styles.routeLabel, { color: subtleText }]}>
                FROM
            </ThemedText>
            <ThemedText style={styles.routeCity} numberOfLines={1}>
              {swap.current_district}
            </ThemedText>
          </View>
          
          {/* Separator / Arrow */}
          <View style={styles.routeSeparator}>
            <Feather name="arrow-right" size={20} color={subtleText} />
          </View>

          {/* Desired Location */}
          <View style={[styles.routeBlock, styles.routeBlockRight]}>
            <ThemedText style={[styles.routeLabel, styles.textRight, { color: tint }]}>
                TO
            </ThemedText>
            <ThemedText style={[styles.routeCity, styles.textRight]} numberOfLines={1}>
              {swap.desired_district}
            </ThemedText>
          </View>
        </View>

        {/* DETAILS: Job Title & Ministry (Secondary Info) */}
        <View style={styles.detailBody}>
            <View style={styles.detailRow}>
                <Feather name="briefcase" size={16} color={subtleText} />
                <ThemedText style={[styles.detailText, { color: text }]} numberOfLines={1}>
                  {swap.job_title}
                </ThemedText>
            </View>
            <View style={styles.detailRow}>
                <Feather name="home" size={16} color={subtleText} />
                <ThemedText style={[styles.detailText, { color: subtleText }]} numberOfLines={1}>
                  {swap.current_ministry}
                </ThemedText>
            </View>
        </View>

        {/* BOTTOM: Actions */}
        <View style={[styles.actions, { borderTopColor: borderCol }]}>
          {/* Edit */}
          <Pressable
            onPress={() => handleEditSwap(swap.id)}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="edit-2" size={16} color={tint} />
            <ThemedText style={[styles.actionText, { color: tint }]}>
              Edit
            </ThemedText>
          </Pressable>

          {/* Toggle Status */}
          <Pressable
            onPress={() => handleToggleStatus(swap.id, swap.status || 'active')}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather
              name={(swap.status || 'active') === 'active' ? 'pause-circle' : 'play-circle'}
              size={16}
              color={text}
            />
            <ThemedText style={[styles.actionText, { color: text }]}>
              {(swap.status || 'active') === 'active' ? 'Pause' : 'Activate'}
            </ThemedText>
          </Pressable>

          {/* Delete */}
          <Pressable
            onPress={() => handleDeleteSwap(swap.id)}
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="trash-2" size={16} color="#EF4444" />
            <ThemedText style={[styles.actionText, { color: '#EF4444' }]}>
              Delete
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  if (isLoading) {
    // ... loading state remains the same
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
        <ScreenHeader title="My Swaps" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <ScreenHeader title="My Swaps" showBack />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tint}
          />
        }
      >
        {swaps.length === 0 ? (
          // ... empty state remains the same
          <View style={styles.emptyState}>
            <Feather name="inbox" size={64} color={`${text}30`} />
            <ThemedText style={[styles.emptyTitle, { color: `${text}77` }]}>
              No Swaps Yet
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: `${text}60` }]}>
              Create your first swap to get started
            </ThemedText>
            <AppButton
              title="Create Swap"
              onPress={() => router.push('/profile-setup')}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.swapsList}>
            {/* RENDER NEW CARD COMPONENT */}
            {swaps.map((swap) => <SwapCard key={swap.id} swap={swap} />)}
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <BottomModal
        isVisible={confirmModal.visible}
        onClose={closeConfirmModal}
        heightPercent={35}
      >
        <View style={styles.modalContent}>
          <View style={[styles.modalIcon, { 
            backgroundColor: confirmModal.type === 'delete' ? '#FEE2E2' : `${tint}15` 
          }]}>
            <Feather
              name={confirmModal.type === 'delete' ? 'trash-2' : 
                    confirmModal.currentStatus === 'active' ? 'pause-circle' : 'play-circle'}
              size={32}
              color={confirmModal.type === 'delete' ? '#EF4444' : tint}
            />
          </View>
          
          <ThemedText style={styles.modalTitle}>
            {confirmModal.type === 'delete' 
              ? 'Delete Swap?' 
              : confirmModal.currentStatus === 'active' 
                ? 'Pause Swap?' 
                : 'Activate Swap?'}
          </ThemedText>
          
          <ThemedText style={[styles.modalMessage, { color: subtleText }]}>
            {confirmModal.type === 'delete'
              ? 'This action cannot be undone. All interests and messages related to this swap will be removed.'
              : confirmModal.currentStatus === 'active'
                ? 'Your swap will be hidden from other users until you activate it again.'
                : 'Your swap will be visible to other users looking for matches.'}
          </ThemedText>

          <View style={styles.modalActions}>
            <Pressable
              onPress={closeConfirmModal}
              style={[styles.modalButton, styles.cancelButton, { borderColor: borderCol }]}
              disabled={isProcessing}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </Pressable>
            
            <Pressable
              onPress={confirmAction}
              style={[
                styles.modalButton, 
                styles.confirmButton,
                { backgroundColor: confirmModal.type === 'delete' ? '#EF4444' : tint }
              ]}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.confirmButtonText}>
                  {confirmModal.type === 'delete' 
                    ? 'Delete' 
                    : confirmModal.currentStatus === 'active' 
                      ? 'Pause' 
                      : 'Activate'}
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 16,
    paddingHorizontal: 32,
  },
  swapsList: {
    gap: 16,
  },

  /* --- NEW CARD STYLES --- */
  swapItem: {
    borderRadius: 16,
    padding: 0, // Padding moved to internal sections
    overflow: 'hidden',
    borderWidth: 1,
  },
  
  // 1. Stat Header (Top Badges)
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  interestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  interestCount: {
    fontSize: 12,
    fontWeight: '700',
  },

  // 2. Swap Route (Middle Section)
  swapRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  routeBlock: {
    flex: 1,
  },
  routeBlockRight: {
    alignItems: 'flex-end',
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  routeCity: {
    fontSize: 18,
    fontWeight: '800', // Extra bold for impact
  },
  routeSeparator: {
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRight: {
    textAlign: 'right',
  },

  // 3. Detail Body
  detailBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)', // Use a fixed light gray for border
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  // 4. Actions Footer
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Modal Styles
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});