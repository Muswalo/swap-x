// Storage utility functions for file uploads
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

export const storageUtils = {
  /**
   * Upload a profile photo to Supabase Storage
   * @param userId - The user ID to associate with the photo
   * @param imageUri - Local URI of the image to upload
   * @returns The public URL of the uploaded image or null on error
   */
  async uploadProfilePhoto(userId: string, imageUri: string): Promise<string | null> {
    try {
      // Compress and resize the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert to blob
      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading profile photo:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error processing profile photo:', error);
      return null;
    }
  },

  /**
   * Upload multiple swap images to Supabase Storage
   * @param userId - The user ID to associate with the images
   * @param imageUris - Array of local URIs of images to upload
   * @returns Array of public URLs of uploaded images
   */
  async uploadSwapImages(userId: string, imageUris: string[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const imageUri of imageUris) {
      try {
        // Compress and resize the image
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 1200 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Convert to blob
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();

        // Generate unique filename
        const fileExt = 'jpg';
        const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `swap-images/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('swap-photos')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (error) {
          console.error('Error uploading swap image:', error);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('swap-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      } catch (error) {
        console.error('Error processing swap image:', error);
      }
    }

    return uploadedUrls;
  },

  /**
   * Delete a file from Supabase Storage
   * @param bucket - The storage bucket name
   * @param filePath - The path to the file in the bucket
   * @returns True if successful, false otherwise
   */
  async deleteFile(bucket: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  /**
   * Extract file path from a Supabase Storage public URL
   * @param publicUrl - The public URL from Supabase Storage
   * @returns The file path or null if invalid URL
   */
  extractFilePath(publicUrl: string): string | null {
    try {
      const url = new URL(publicUrl);
      const pathParts = url.pathname.split('/');
      // Remove the first parts (e.g., /storage/v1/object/public/bucket-name/)
      const filePathIndex = pathParts.indexOf('public') + 2;
      return pathParts.slice(filePathIndex).join('/');
    } catch (error) {
      console.error('Error extracting file path:', error);
      return null;
    }
  },
};
