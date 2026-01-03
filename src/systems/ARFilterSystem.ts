import { StorageAdapter } from '../core/StorageAdapter';

export interface ARFilter {
  id: string;
  name: string;
  effect: string;
}

export class ARFilterSystem {
  private currentFilter: string | null;
  private filters: ARFilter[];
  private storage: StorageAdapter;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.currentFilter = null;
    this.filters = this.initializeFilters();
  }
  
  private initializeFilters(): ARFilter[] {
    return [
      { id: 'rainbow', name: 'Rainbow', effect: 'hue-rotate(90deg)' },
      { id: 'vintage', name: 'Vintage', effect: 'sepia(0.5) contrast(1.2)' },
      { id: 'cyberpunk', name: 'Cyberpunk', effect: 'saturate(2) contrast(1.3)' },
      { id: 'noir', name: 'Noir', effect: 'grayscale(1) contrast(1.5)' },
      { id: 'dream', name: 'Dream', effect: 'blur(2px) brightness(1.2)' },
      { id: 'pixel', name: 'Pixelated', effect: 'contrast(1.5) saturate(1.5)' }
    ];
  }
  
  public applyFilter(filterId: string, canvasElement?: HTMLCanvasElement): boolean {
    const filter = this.filters.find(f => f.id === filterId);
    if (!filter) return false;
    
    this.currentFilter = filterId;
    
    if (canvasElement) {
      canvasElement.style.filter = filter.effect;
    }
    
    return true;
  }
  
  /**
   * Set filter (alias for applyFilter for compatibility)
   */
  public setFilter(filterId: string, canvasElement?: HTMLCanvasElement): boolean {
    if (filterId === 'none') {
      this.removeFilter(canvasElement);
      return true;
    }
    return this.applyFilter(filterId, canvasElement);
  }
  
  public removeFilter(canvasElement?: HTMLCanvasElement): void {
    this.currentFilter = null;
    
    if (canvasElement) {
      canvasElement.style.filter = 'none';
    }
  }
  
  public getCurrentFilter(): ARFilter | null {
    if (!this.currentFilter) return null;
    const filter = this.filters.find(f => f.id === this.currentFilter);
    return filter || null;
  }
  
  public getFilters(): ARFilter[] {
    return [...this.filters];
  }
  
  public hasFilter(): boolean {
    return this.currentFilter !== null;
  }
}
