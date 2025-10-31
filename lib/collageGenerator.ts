import { TimeCapsule, EmotionalMoment } from '@/types/timeCapsule';
import { emotionEmojis } from '@/lib/emotion-themes';

export interface CollageOptions {
  photoSize?: number;
  spacing?: number;
  backgroundColor?: string;
  headerHeight?: number;
  maxColumns?: number;
  maxCanvasWidth?: number;
  minPhotoSize?: number;
  adaptiveScaling?: boolean;
}

/**
 * Generate a beautiful PNG collage from captured emotional moments
 */
/**
 * Calculate optimal photo size based on image count
 */
function calculatePhotoSize(imageCount: number, minSize: number, adaptiveScaling: boolean): number {
  if (!adaptiveScaling) return 180; // Default size

  if (imageCount <= 50) return 180;      // Ideal size
  if (imageCount <= 100) return 140;     // Medium size
  if (imageCount <= 200) return 120;     // Smaller size
  return Math.max(minSize, 100);         // Minimum size
}

export async function generateCollage(
  event: TimeCapsule,
  options: CollageOptions = {}
): Promise<string> {
  const {
    maxCanvasWidth = 1920,
    minPhotoSize = 100,
    adaptiveScaling = true,
    backgroundColor = '#f0fdf4', // emerald-50
    headerHeight = 150,
    maxColumns = 8,
  } = options;

  const moments = event.moments;

  // Calculate adaptive photo size
  const photoSize = options.photoSize || calculatePhotoSize(moments.length, minPhotoSize, adaptiveScaling);

  // Calculate spacing proportional to photo size
  const spacing = Math.max(8, Math.floor(photoSize * 0.067)); // ~6.7% of photo size

  return new Promise((resolve, reject) => {
    if (moments.length === 0) {
      reject(new Error('No moments to generate collage'));
      return;
    }

    // Calculate grid dimensions with fixed width constraint
    const paddingX = 40;
    const maxCols = Math.floor((maxCanvasWidth - paddingX * 2 + spacing) / (photoSize + spacing));
    const cols = Math.min(Math.max(1, maxCols), maxColumns, Math.ceil(Math.sqrt(moments.length)));
    const rows = Math.ceil(moments.length / cols);

    console.log(`📐 Collage layout: ${cols}x${rows} grid, ${photoSize}px photos, ${moments.length} images`);

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    // Canvas dimensions with padding
    const paddingY = 40;
    canvas.width = Math.min(paddingX * 2 + cols * photoSize + (cols - 1) * spacing, maxCanvasWidth);
    canvas.height = headerHeight + paddingY + rows * photoSize + (rows - 1) * spacing + paddingY;

    console.log(`🖼️  Canvas size: ${canvas.width}x${canvas.height}px`);

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw header
    drawCollageHeader(ctx, event, canvas.width, headerHeight);

    // Load and draw all images
    let loadedImages = 0;
    const totalImages = moments.length;

    moments.forEach((moment, index) => {
      const img = new Image();

      img.onload = () => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = paddingX + col * (photoSize + spacing);
        const y = headerHeight + paddingY + row * (photoSize + spacing);

        // Draw photo with rounded corners and border
        drawRoundedImageWithBorder(ctx, img, x, y, photoSize, photoSize, 12);

        // Draw emotion overlay
        drawEmotionOverlay(ctx, moment, x, y, photoSize);

        // Draw timestamp
        drawTimestamp(ctx, moment, x, y, photoSize);

        loadedImages++;

        // When all images are loaded, resolve
        if (loadedImages === totalImages) {
          resolve(canvas.toDataURL('image/png', 0.95));
        }
      };

      img.onerror = () => {
        console.error('Failed to load image:', index);
        loadedImages++;

        // Continue even if some images fail
        if (loadedImages === totalImages) {
          resolve(canvas.toDataURL('image/png', 0.95));
        }
      };

      img.src = moment.imageData;
    });
  });
}

/**
 * Draw the collage header with event info
 */
function drawCollageHeader(
  ctx: CanvasRenderingContext2D,
  event: TimeCapsule,
  canvasWidth: number,
  headerHeight: number
) {
  const centerX = canvasWidth / 2;

  // Event name - responsive font size
  ctx.fillStyle = '#065F46'; // emerald-800
  ctx.font = 'bold 36px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(event.eventName, centerX, 25);

  // Stats line
  const durationMins = Math.floor(event.statistics.duration / 60);
  const durationSecs = event.statistics.duration % 60;
  const stats = `${event.statistics.totalMoments} moments • ${durationMins}m ${durationSecs}s • ${event.statistics.averageSmile}% happiness`;

  ctx.fillStyle = '#047857'; // emerald-700
  ctx.font = '18px Inter, -apple-system, sans-serif';
  ctx.fillText(stats, centerX, 70);

  // Date
  const dateStr = new Date(event.startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ctx.fillStyle = '#6B7280'; // gray-600
  ctx.font = '14px Inter, -apple-system, sans-serif';
  ctx.fillText(dateStr, centerX, 100);

  // Decorative line
  ctx.strokeStyle = '#10B981'; // emerald-500
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvasWidth * 0.3, headerHeight - 15);
  ctx.lineTo(canvasWidth * 0.7, headerHeight - 15);
  ctx.stroke();
}

/**
 * Draw image with rounded corners and border
 */
function drawRoundedImageWithBorder(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  // Draw white border
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 4, width + 8, height + 8, radius + 2);
  ctx.fill();

  // Draw shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  // Clip to rounded rectangle
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.clip();

  // Draw image (cropped to square from center)
  const imgAspect = img.width / img.height;
  let sx, sy, sWidth, sHeight;

  if (imgAspect > 1) {
    // Landscape - crop width
    sHeight = img.height;
    sWidth = img.height;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    // Portrait or square - crop height
    sWidth = img.width;
    sHeight = img.width;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);

  ctx.restore();
  ctx.shadowColor = 'transparent';

  // Draw border
  ctx.strokeStyle = '#10B981'; // emerald-500
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.stroke();
}

/**
 * Draw emotion emoji overlay
 */
function drawEmotionOverlay(
  ctx: CanvasRenderingContext2D,
  moment: EmotionalMoment,
  x: number,
  y: number,
  size: number
) {
  // Emoji badge background
  const badgeSize = 50;
  const badgeX = x + 8;
  const badgeY = y + 8;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 10);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Emoji
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emotionEmojis[moment.emotion], badgeX + badgeSize / 2, badgeY + badgeSize / 2);

  // Smile percentage badge (top right)
  const smileBadgeWidth = 55;
  const smileBadgeHeight = 28;
  const smileBadgeX = x + size - smileBadgeWidth - 8;
  const smileBadgeY = y + 8;

  // Smile badge background
  const smileColor = moment.smilePercentage >= 70 ? '#10B981' : moment.smilePercentage >= 40 ? '#F59E0B' : '#6B7280';
  ctx.fillStyle = smileColor;
  ctx.beginPath();
  ctx.roundRect(smileBadgeX, smileBadgeY, smileBadgeWidth, smileBadgeHeight, 6);
  ctx.fill();

  // Smile percentage text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(moment.smilePercentage)}%`, smileBadgeX + smileBadgeWidth / 2, smileBadgeY + smileBadgeHeight / 2);
}

/**
 * Draw timestamp at bottom
 */
function drawTimestamp(
  ctx: CanvasRenderingContext2D,
  moment: EmotionalMoment,
  x: number,
  y: number,
  size: number
) {
  // Background bar
  const barHeight = 32;
  const barY = y + size - barHeight;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(x, barY, size, barHeight);

  // Time text
  const time = new Date(moment.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '13px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(time, x + size / 2, barY + barHeight / 2);
}

/**
 * Helper to format duration
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

/**
 * Download collage as PNG file
 */
export function downloadCollage(dataUrl: string, eventName: string) {
  const link = document.createElement('a');
  link.download = `${eventName.replace(/[^a-z0-9]/gi, '_')}_collage_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}
