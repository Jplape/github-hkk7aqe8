import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export class DateService {
  private static instance: DateService;

  private constructor() {}

  public static getInstance(): DateService {
    if (!DateService.instance) {
      DateService.instance = new DateService();
    }
    return DateService.instance;
  }

  // Validation et parsing
  public static isValidTime(timeStr: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
  }

  public static parseTime(timeStr: string): { hours: number; minutes: number } {
    if (!this.isValidTime(timeStr)) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }
    const [h, m] = timeStr.split(':');
    return { hours: parseInt(h), minutes: parseInt(m) };
  }

  // Conversion timezone
  public static toLocalTime(utcTime: string, referenceDate: Date): string {
    const { hours, minutes } = this.parseTime(utcTime);
    const date = new Date(referenceDate);
    date.setHours(hours, minutes);
    
    const offset = referenceDate.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);
    
    return format(date, 'HH:mm');
  }

  // Formatage
  public static formatTaskDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  public static formatDisplayDate(date: Date): string {
    return format(date, 'EEE d MMM', { locale: fr });
  }

  public static formatLongDate(date: Date | string): string {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return format(date, 'd MMMM yyyy', { locale: fr });
  }

  // Utilitaires calendrier
  public static getWeekDays(startDate: Date): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });
  }

  // Normalisation du temps avec gestion timezone
  public static normalizeTime(timeStr: string, referenceDate?: Date): string {
    // Nettoyage du format (supprime les espaces, accepte H:mm ou HH:mm)
    const cleanedTime = timeStr.trim().replace(/\s/g, '');
    
    // Validation basique
    if (!/^\d{1,2}:\d{2}$/.test(cleanedTime)) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    // Conversion timezone si référence fournie
    if (referenceDate) {
      return this.toLocalTime(cleanedTime, referenceDate);
    }

    // Formatage standard si pas de conversion nécessaire
    const [h, m] = cleanedTime.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
}