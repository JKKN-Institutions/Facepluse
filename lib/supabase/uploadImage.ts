import { supabase } from './client';

// Global flags to track bucket state (prevents spam and unnecessary upload attempts)
let bucketErrorShown = false;
let bucketAvailable = true; // Assume available until proven otherwise

/**
 * Upload a base64 image to Supabase Storage
 *
 * ⚠️ SETUP REQUIRED:
 * Before using this function, you MUST create the 'mood-captures' bucket in Supabase:
 * 1. Go to Supabase Dashboard → Storage → New Bucket
 * 2. Name: "mood-captures"
 * 3. Public bucket: ✅ MUST be checked
 * 4. Add policy: Allow all operations (SELECT, INSERT, UPDATE, DELETE)
 * 5. See SETUP_TIME_CAPSULE.md for detailed instructions
 *
 * @param base64Data - Base64 encoded image data (with or without data:image prefix)
 * @param bucket - Storage bucket name (default: 'mood-captures')
 * @param path - Optional subdirectory path
 * @returns Public URL of uploaded image or null if failed
 */
export async function uploadImage(
  base64Data: string,
  bucket: string = 'mood-captures',
  path: string = ''
): Promise<string | null> {
  // Early return if bucket is known to be unavailable
  // This prevents unnecessary processing and network requests
  if (!bucketAvailable) {
    console.debug('⏭️ Skipping upload - bucket unavailable');
    return null;
  }

  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to blob
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${path ? path + '/' : ''}${timestamp}_${random}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // Check if bucket doesn't exist
      const isBucketNotFound = error.message?.includes('Bucket not found') || error.statusCode === '404';

      if (isBucketNotFound) {
        // Mark bucket as unavailable to prevent future upload attempts
        bucketAvailable = false;

        // Only show detailed error ONCE per session to prevent console spam
        if (!bucketErrorShown) {
          bucketErrorShown = true;
          console.error('');
          console.error('🚨 STORAGE BUCKET NOT FOUND! 🚨');
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('The Supabase storage bucket "mood-captures" does not exist.');
          console.error('');
          console.error('📋 TO FIX THIS:');
          console.error('1. Go to: https://supabase.com/dashboard');
          console.error('2. Select your project');
          console.error('3. Navigate to Storage → New Bucket');
          console.error('4. Create bucket named: "mood-captures"');
          console.error('5. ✅ IMPORTANT: Check "Public bucket"');
          console.error('6. Set policy to allow all operations (see SETUP_TIME_CAPSULE.md)');
          console.error('');
          console.error('📖 Full instructions: SETUP_TIME_CAPSULE.md (Step 1B)');
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('⏩ App will continue to work without image storage.');
          console.error('⏩ Future upload attempts will be skipped automatically.');
          console.error('');
        }
      } else {
        // Other errors - log them normally
        console.error('❌ Upload error:', error);
      }

      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    console.log('✅ Image uploaded:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('❌ Failed to upload image:', error);
    return null;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - Full public URL of the image
 * @param bucket - Storage bucket name (default: 'mood-captures')
 * @returns true if deleted successfully
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'mood-captures'
): Promise<boolean> {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filename]);

    if (error) {
      console.error('❌ Delete error:', error);
      return false;
    }

    console.log('✅ Image deleted:', filename);
    return true;

  } catch (error) {
    console.error('❌ Failed to delete image:', error);
    return false;
  }
}

/**
 * Reset bucket availability state
 * Call this function if you've created the bucket and want to re-enable uploads
 * @example
 * // After creating the bucket in Supabase dashboard:
 * resetBucketState();
 */
export function resetBucketState(): void {
  bucketAvailable = true;
  bucketErrorShown = false;
  console.log('✅ Bucket state reset - uploads will be attempted again');
}
