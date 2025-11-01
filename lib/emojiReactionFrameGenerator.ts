import QRCode from 'qrcode';

export interface CapturedReaction {
  image: string; // base64 image
  emoji: string;
  emotion: string;
  timestamp: number;
}

export interface FrameGeneratorOptions {
  reactions: CapturedReaction[];
  shareUrl?: string;
}

/**
 * Generate a final frame with 3 captured reactions and QR code
 */
export async function generateEmojiReactionFrame(
  options: FrameGeneratorOptions
): Promise<string> {
  const { reactions, shareUrl } = options;

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Set dimensions - wide format for 3 images
  const frameWidth = 1200;
  const frameHeight = 800;
  canvas.width = frameWidth;
  canvas.height = frameHeight;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, frameWidth, frameHeight);
  gradient.addColorStop(0, '#ECFDF5'); // Emerald-50
  gradient.addColorStop(1, '#D1FAE5'); // Emerald-100
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  // Header section
  ctx.fillStyle = '#059669'; // Emerald-600
  ctx.font = 'bold 48px "Poppins", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎭 Emoji Reaction Challenge', frameWidth / 2, 80);

  // Divider line
  ctx.strokeStyle = '#10B981'; // Emerald-500
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 120);
  ctx.lineTo(frameWidth - 100, 120);
  ctx.stroke();

  // Calculate image dimensions and spacing
  const imageSize = 280;
  const spacing = 40;
  const totalWidth = imageSize * 3 + spacing * 2;
  const startX = (frameWidth - totalWidth) / 2;
  const imageY = 180;

  // Draw 3 reaction images
  for (let i = 0; i < reactions.length && i < 3; i++) {
    const reaction = reactions[i];
    const x = startX + (imageSize + spacing) * i;

    // Draw image container with border
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    ctx.fillRect(x - 10, imageY - 10, imageSize + 20, imageSize + 20);
    ctx.shadowBlur = 0;

    // Draw image
    try {
      const img = await loadImage(reaction.image);
      ctx.drawImage(img, x, imageY, imageSize, imageSize);
    } catch (error) {
      console.error('Failed to load image:', error);
      // Draw placeholder if image fails
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(x, imageY, imageSize, imageSize);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '24px "Poppins"';
      ctx.textAlign = 'center';
      ctx.fillText('Image Error', x + imageSize / 2, imageY + imageSize / 2);
    }

    // Draw emoji label below image
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 72px "Poppins"';
    ctx.textAlign = 'center';
    ctx.fillText(reaction.emoji, x + imageSize / 2, imageY + imageSize + 80);

    // Draw emotion label
    ctx.fillStyle = '#6B7280'; // Gray-500
    ctx.font = '20px "Poppins"';
    ctx.fillText(
      reaction.emotion.charAt(0).toUpperCase() + reaction.emotion.slice(1),
      x + imageSize / 2,
      imageY + imageSize + 120
    );
  }

  // Footer section
  const footerY = imageY + imageSize + 160;

  // Timestamp
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  ctx.fillStyle = '#6B7280';
  ctx.font = '18px "Poppins"';
  ctx.textAlign = 'left';
  ctx.fillText(timestamp, 100, footerY);

  // Branding
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 20px "Poppins"';
  ctx.textAlign = 'center';
  ctx.fillText('Facepluse Emoji Challenge', frameWidth / 2, footerY);

  // QR Code
  if (shareUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: '#059669', // Emerald-600
          light: '#FFFFFF',
        },
      });

      const qrImg = await loadImage(qrDataUrl);
      const qrX = frameWidth - 220;
      const qrY = footerY - 100;

      // QR background
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 15;
      ctx.fillRect(qrX - 10, qrY - 10, 140, 140);
      ctx.shadowBlur = 0;

      // Draw QR code
      ctx.drawImage(qrImg, qrX, qrY, 120, 120);

      // QR label
      ctx.fillStyle = '#6B7280';
      ctx.font = '14px "Poppins"';
      ctx.textAlign = 'center';
      ctx.fillText('Scan to Share', qrX + 60, qrY + 155);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  }

  // Convert canvas to data URL
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Helper function to load image from base64 or URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Download the generated frame
 */
export function downloadFrame(dataUrl: string, filename?: string) {
  const link = document.createElement('a');
  link.download = filename || `emoji-reaction-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}
