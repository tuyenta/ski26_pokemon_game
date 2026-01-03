import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';

export interface PhotoOptions {
  pokemonId: number;
  pokemonName: string;
  pokemonType: string;
  trainerName: string;
  isShiny: boolean;
}

export class PhotoCapture {
  private eventBus: EventBus;
  
  constructor() {
    this.eventBus = EventBus.getInstance();
  }
  
  /**
   * Capture photo from canvas (simplified version)
   */
  public async capturePhoto(
    canvasOrVideo: HTMLCanvasElement | HTMLVideoElement,
    options?: PhotoOptions
  ): Promise<string | null> {
    // If no options provided, create a simple screenshot
    if (!options) {
      const canvas = canvasOrVideo as HTMLCanvasElement;
      const dataUrl = canvas.toDataURL('image/png');
      
      // Emit event
      this.eventBus.emit(GameEvent.PHOTO_TAKEN, {
        timestamp: Date.now(),
        dataUrl
      });
      
      // Trigger download
      this.downloadPhoto(dataUrl, `pokemon-photo-${Date.now()}.png`);
      return dataUrl;
    }
    
    return this.capturePhotoWithOptions(canvasOrVideo as HTMLVideoElement, options);
  }
  
  private async capturePhotoWithOptions(
    videoElement: HTMLVideoElement,
    options: PhotoOptions
  ): Promise<string | null> {
    try {
      // Create canvas for photo
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 850;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, 850);
      const typeColor = this.getTypeColor(options.pokemonType);
      gradient.addColorStop(0, typeColor);
      gradient.addColorStop(1, this.darkenColor(typeColor, 0.5));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 850);
      
      // Draw trainer photo from video
      ctx.save();
      ctx.translate(300, 250);
      ctx.scale(-1, 1); // Mirror the video
      ctx.drawImage(videoElement, -200, -150, 400, 300);
      ctx.restore();
      
      // Draw frame around photo
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 8;
      ctx.strokeRect(100, 100, 400, 300);
      
      // Draw Pokemon sprite
      const spriteImg = new Image();
      spriteImg.crossOrigin = 'anonymous';
      spriteImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${options.pokemonId}.png`;
      
      await new Promise((resolve) => {
        spriteImg.onload = resolve;
        spriteImg.onerror = resolve;
      });
      
      ctx.drawImage(spriteImg, 200, 450, 200, 200);
      
      // Draw text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(options.pokemonName.toUpperCase(), 300, 700);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Type: ${options.pokemonType}`, 300, 740);
      
      if (options.isShiny) {
        ctx.fillText('✨ SHINY ✨', 300, 780);
      }
      
      ctx.font = '18px Arial';
      ctx.fillText(`Trainer: ${options.trainerName}`, 300, 820);
      
      // Emit event
      this.eventBus.emit(GameEvent.PHOTO_TAKEN, {
        timestamp: Date.now(),
        pokemonId: options.pokemonId
      });
      
      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      this.downloadPhoto(dataUrl, `${options.pokemonName}-${Date.now()}.png`);
      
      return dataUrl;
    } catch (error) {
      console.error('Failed to capture photo:', error);
      return null;
    }
  }
  
  /**
   * Download photo to device
   */
  private downloadPhoto(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  private getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    
    return colors[type.toLowerCase()] || '#A8A878';
  }
  
  private darkenColor(color: string, factor: number): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Darken
    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}
