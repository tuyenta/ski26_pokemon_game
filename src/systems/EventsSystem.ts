export interface SpecialEvent {
  id: string;
  name: string;
  start: [number, number]; // [month, day]
  end: [number, number];
  bonus: string;
  emoji: string;
}

export interface EventBonus {
  type: 'xp' | 'shiny' | 'legendary' | 'type_boost' | 'gifts';
  multiplier?: number;
  chance?: number;
  boostedType?: string;
  extraCoins?: number;
}

export class EventsSystem {
  private activeEvent: SpecialEvent | null;
  
  constructor() {
    this.activeEvent = this.checkActiveEvent();
  }
  
  private checkActiveEvent(): SpecialEvent | null {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    const events: SpecialEvent[] = [
      { id: 'newyear', name: 'New Year Celebration', start: [1, 1], end: [1, 7], bonus: 'double_xp', emoji: '🎉' },
      { id: 'valentine', name: "Valentine's Day", start: [2, 14], end: [2, 14], bonus: 'shiny_boost', emoji: '💝' },
      { id: 'spring', name: 'Spring Fest', start: [3, 20], end: [3, 27], bonus: 'rare_spawns', emoji: '🌸' },
      { id: 'summer', name: 'Summer Beach Party', start: [7, 1], end: [7, 7], bonus: 'water_boost', emoji: '🏖️' },
      { id: 'halloween', name: 'Halloween Spooktacular', start: [10, 31], end: [10, 31], bonus: 'ghost_boost', emoji: '🎃' },
      { id: 'christmas', name: 'Winter Wonderland', start: [12, 24], end: [12, 26], bonus: 'gifts', emoji: '🎄' }
    ];
    
    for (const event of events) {
      const [startMonth, startDay] = event.start;
      const [endMonth, endDay] = event.end;
      
      if ((month === startMonth && day >= startDay && day <= endDay) ||
          (month === endMonth && day <= endDay && startMonth !== endMonth)) {
        return event;
      }
    }
    
    return null;
  }
  
  public getActiveEvent(): SpecialEvent | null {
    return this.activeEvent ? { ...this.activeEvent } : null;
  }
  
  public hasActiveEvent(): boolean {
    return this.activeEvent !== null;
  }
  
  public applyEventBonus(): EventBonus | null {
    if (!this.activeEvent) return null;
    
    switch(this.activeEvent.bonus) {
      case 'double_xp':
        return { type: 'xp', multiplier: 2 };
      case 'shiny_boost':
        return { type: 'shiny', multiplier: 2 };
      case 'rare_spawns':
        return { type: 'legendary', chance: 0.1 };
      case 'water_boost':
        return { type: 'type_boost', boostedType: 'water' };
      case 'ghost_boost':
        return { type: 'type_boost', boostedType: 'ghost' };
      case 'gifts':
        return { type: 'gifts', extraCoins: 50 };
      default:
        return null;
    }
  }
  
  public refreshEvent(): void {
    this.activeEvent = this.checkActiveEvent();
  }
}
