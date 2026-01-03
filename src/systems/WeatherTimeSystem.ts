import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/events';
import { StorageAdapter } from '../core/StorageAdapter';

export interface WeatherCondition {
  type: 'sunny' | 'rainy' | 'cloudy';
  emoji: string;
}

export interface TimeOfDay {
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  emoji: string;
}

export interface WeatherBonus {
  sunny: string[];
  rainy: string[];
  cloudy: string[];
  night: string[];
}

export class WeatherTimeSystem {
  private currentWeather: WeatherCondition['type'];
  private timeOfDay: TimeOfDay['period'];
  private readonly weatherBonus: WeatherBonus;
  private storage: StorageAdapter;
  private eventBus: EventBus;
  
  constructor() {
    this.storage = StorageAdapter.getInstance();
    this.eventBus = EventBus.getInstance();
    
    this.weatherBonus = {
      sunny: ['fire', 'grass', 'ground'],
      rainy: ['water', 'electric', 'bug'],
      cloudy: ['normal', 'flying', 'fairy'],
      night: ['dark', 'ghost', 'psychic']
    };
    
    this.currentWeather = this.loadWeather();
    this.timeOfDay = this.getTimeOfDay();
    
    // Update weather periodically
    this.scheduleWeatherUpdate();
  }
  
  private loadWeather(): WeatherCondition['type'] {
    const saved = this.storage.get<WeatherCondition['type']>('weather');
    if (saved) return saved;
    return this.detectWeather();
  }
  
  private detectWeather(): WeatherCondition['type'] {
    const weathers: WeatherCondition['type'][] = ['sunny', 'rainy', 'cloudy'];
    return weathers[Math.floor(Math.random() * weathers.length)];
  }
  
  private getTimeOfDay(): TimeOfDay['period'] {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }
  
  public shouldBoostPokemon(pokemonType: string): boolean {
    const weatherTypes = this.weatherBonus[this.currentWeather] || [];
    const nightTypes = this.timeOfDay === 'night' ? this.weatherBonus.night : [];
    return weatherTypes.includes(pokemonType) || nightTypes.includes(pokemonType);
  }
  
  public getCurrentWeatherBonus(): string[] {
    const weatherTypes = this.weatherBonus[this.currentWeather] || [];
    const nightTypes = this.timeOfDay === 'night' ? this.weatherBonus.night : [];
    return [...new Set([...weatherTypes, ...nightTypes])];
  }
  
  public getCurrentWeather(): WeatherCondition {
    return {
      type: this.currentWeather,
      emoji: this.getWeatherEmoji()
    };
  }
  
  public getCurrentTime(): TimeOfDay {
    return {
      period: this.timeOfDay,
      emoji: this.getTimeEmoji()
    };
  }
  
  private getWeatherEmoji(): string {
    const emojis = { sunny: '☀️', rainy: '🌧️', cloudy: '☁️' };
    return emojis[this.currentWeather] || '🌤️';
  }
  
  private getTimeEmoji(): string {
    const emojis = { morning: '🌅', afternoon: '☀️', evening: '🌆', night: '🌙' };
    return emojis[this.timeOfDay] || '⏰';
  }
  
  public updateWeather(): void {
    const oldWeather = this.currentWeather;
    this.currentWeather = this.detectWeather();
    this.storage.set('weather', this.currentWeather);
    
    if (oldWeather !== this.currentWeather) {
      this.eventBus.emit(GameEvent.WEATHER_CHANGED, {
        weather: this.currentWeather,
        emoji: this.getWeatherEmoji()
      });
    }
  }
  
  public updateTime(): void {
    const oldTime = this.timeOfDay;
    this.timeOfDay = this.getTimeOfDay();
    
    if (oldTime !== this.timeOfDay) {
      this.eventBus.emit(GameEvent.TIME_CHANGED, {
        timeOfDay: this.timeOfDay,
        emoji: this.getTimeEmoji()
      });
    }
  }
  
  private scheduleWeatherUpdate(): void {
    // Update weather every 30 minutes
    setInterval(() => this.updateWeather(), 30 * 60 * 1000);
    // Update time every minute
    setInterval(() => this.updateTime(), 60 * 1000);
  }
}
