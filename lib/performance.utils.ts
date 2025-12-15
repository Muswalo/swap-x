/**
 * Performance Optimization Utilities
 * Utilities for optimizing database queries, real-time subscriptions, and app performance
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Cache for storing frequently accessed data
 */
class DataCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes default TTL

  set(key: string, data: any, customTTL?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (customTTL || this.ttl),
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const dataCache = new DataCache();

/**
 * Optimized query builder for swaps with pagination
 */
export async function getSwapsOptimized(params: {
  page?: number;
  pageSize?: number;
  ministry?: string;
  district?: string;
  status?: string;
}) {
  const { page = 1, pageSize = 20, ministry, district, status = 'active' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build cache key
  const cacheKey = `swaps:${page}:${pageSize}:${ministry}:${district}:${status}`;
  
  // Check cache first
  const cached = dataCache.get(cacheKey);
  if (cached) {
    return { data: cached, error: null, fromCache: true };
  }

  let query = supabase
    .from('swaps')
    .select(`
      id,
      current_ministry,
      current_district,
      current_institution,
      current_area_type,
      desired_ministry,
      desired_district,
      desired_area_type,
      job_title,
      additional_details,
      images,
      status,
      created_at,
      profiles!swaps_user_id_fkey (
        first_name,
        last_name,
        profile_photo_url
      )
    `, { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (ministry) {
    query = query.eq('current_ministry', ministry);
  }

  if (district) {
    query = query.or(`current_district.eq.${district},desired_district.eq.${district}`);
  }

  const result = await query;

  // Cache successful results
  if (!result.error && result.data) {
    dataCache.set(cacheKey, result.data, 2 * 60 * 1000); // 2 minutes for swap lists
  }

  return result;
}

/**
 * Optimized messages query with pagination
 */
export async function getMessagesOptimized(conversationId: string, page: number = 1, pageSize: number = 50) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const cacheKey = `messages:${conversationId}:${page}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached) {
    return { data: cached, error: null, fromCache: true };
  }

  const result = await supabase
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      message_type,
      read_at,
      created_at,
      profiles!messages_sender_id_fkey (
        first_name,
        last_name,
        profile_photo_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(from, to);

  if (!result.error && result.data) {
    dataCache.set(cacheKey, result.data, 1 * 60 * 1000); // 1 minute for messages
  }

  return result;
}

/**
 * Real-time subscription manager to prevent memory leaks
 */
class SubscriptionManager {
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  subscribe(key: string, channel: RealtimeChannel): void {
    // Unsubscribe from existing channel with same key
    this.unsubscribe(key);
    this.subscriptions.set(key, channel);
  }

  unsubscribe(key: string): void {
    const channel = this.subscriptions.get(key);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }

  getActiveCount(): number {
    return this.subscriptions.size;
  }
}

export const subscriptionManager = new SubscriptionManager();

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Batch update function to reduce database calls
 */
export async function batchUpdate<T>(
  table: string,
  updates: Array<{ id: string; data: Partial<T> }>,
  batchSize: number = 10
) {
  const results = [];
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const promises = batch.map(({ id, data }) =>
      supabase.from(table).update(data).eq('id', id)
    );
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Optimized profile fetch with caching
 */
export async function getProfileOptimized(userId: string) {
  const cacheKey = `profile:${userId}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached) {
    return { data: cached, error: null, fromCache: true };
  }

  const result = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!result.error && result.data) {
    dataCache.set(cacheKey, result.data, 10 * 60 * 1000); // 10 minutes for profiles
  }

  return result;
}

/**
 * Invalidate cache for specific data types
 */
export function invalidateCache(type: 'swaps' | 'messages' | 'profile' | 'all', id?: string) {
  if (type === 'all') {
    dataCache.clear();
    return;
  }

  if (type === 'swaps') {
    // Invalidate all swap-related cache entries
    dataCache.invalidate('swaps');
  } else if (type === 'messages' && id) {
    dataCache.invalidate(`messages:${id}`);
  } else if (type === 'profile' && id) {
    dataCache.invalidate(`profile:${id}`);
  }
}

/**
 * Preload critical data
 */
export async function preloadCriticalData(userId: string) {
  try {
    // Preload user profile
    await getProfileOptimized(userId);
    
    // Preload first page of swaps
    await getSwapsOptimized({ page: 1, pageSize: 20 });
    
    // Preload user settings
    const settingsResult = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!settingsResult.error && settingsResult.data) {
      dataCache.set(`settings:${userId}`, settingsResult.data, 10 * 60 * 1000);
    }
  } catch (error) {
    console.error('Error preloading data:', error);
  }
}

/**
 * Image optimization helper
 */
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return url;
  
  // If using Supabase storage, add transformation parameters
  if (url.includes('supabase')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', '80');
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
}

/**
 * Monitor performance metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(label: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      const existing = this.metrics.get(label) || [];
      existing.push(duration);
      this.metrics.set(label, existing);
    };
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }

  getMetrics(): Record<string, { avg: number; count: number; max: number; min: number }> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((times, label) => {
      result[label] = {
        avg: this.getAverageTime(label),
        count: times.length,
        max: Math.max(...times),
        min: Math.min(...times),
      };
    });
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
