/**
 * Philippine Time Utility
 * Handles timezone conversion between UTC (database) and Philippine Time (UTC+8)
 * TypeScript conversion of the mobile app's PhilippineTime utility
 */

export class PhilippineTime {
  // Philippine timezone offset is UTC+8
  private static readonly PHILIPPINE_OFFSET_HOURS = 8;

  /**
   * Get current Philippine time
   */
  static now(): Date {
    const utcNow = new Date();
    return new Date(utcNow.getTime() + (this.PHILIPPINE_OFFSET_HOURS * 60 * 60 * 1000));
  }

  /**
   * Convert UTC DateTime to Philippine time
   */
  static fromUtc(utcDateTime: Date): Date {
    return new Date(utcDateTime.getTime() + (this.PHILIPPINE_OFFSET_HOURS * 60 * 60 * 1000));
  }

  /**
   * Convert Philippine time to UTC for database storage
   */
  static toUtc(philippineDateTime: Date): Date {
    return new Date(philippineDateTime.getTime() - (this.PHILIPPINE_OFFSET_HOURS * 60 * 60 * 1000));
  }

  /**
   * Format Philippine time for display (e.g., "6:05 PM")
   */
  static formatTime(philippineDateTime: Date): string {
    return philippineDateTime.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format Philippine date and time for display (e.g., "June 4, 2025 6:05 PM")
   */
  static formatDateTime(philippineDateTime: Date): string {
    return philippineDateTime.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Format Philippine date for display (e.g., "June 4, 2025")
   */
  static formatDate(philippineDateTime: Date): string {
    return philippineDateTime.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format Philippine date for short display (e.g., "Jun 4, 2025")
   */
  static formatDateShort(philippineDateTime: Date): string {
    return philippineDateTime.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get current Philippine time as formatted string
   */
  static getCurrentTimeString(): string {
    return this.formatTime(this.now());
  }

  /**
   * Get current Philippine date and time as formatted string
   */
  static getCurrentDateTimeString(): string {
    return this.formatDateTime(this.now());
  }

  /**
   * Convert database timestamp (UTC string) to Philippine time display
   */
  static formatDatabaseTime(utcTimeString?: string | null): string {
    if (!utcTimeString) return 'Unknown time';

    try {
      const utcDateTime = new Date(utcTimeString);
      if (isNaN(utcDateTime.getTime())) return 'Invalid time';
      
      const philippineDateTime = this.fromUtc(utcDateTime);
      return this.formatDateTime(philippineDateTime);
    } catch (e) {
      return 'Invalid time';
    }
  }

  /**
   * Convert database timestamp (UTC string) to Philippine date display
   */
  static formatDatabaseDate(utcTimeString?: string | null): string {
    if (!utcTimeString) return 'Unknown date';

    try {
      const utcDateTime = new Date(utcTimeString);
      if (isNaN(utcDateTime.getTime())) return 'Invalid date';
      
      const philippineDateTime = this.fromUtc(utcDateTime);
      return this.formatDate(philippineDateTime);
    } catch (e) {
      return 'Invalid date';
    }
  }

  /**
   * Convert database timestamp (UTC string) to Philippine short date display
   */
  static formatDatabaseDateShort(utcTimeString?: string | null): string {
    if (!utcTimeString) return 'Unknown date';

    try {
      const utcDateTime = new Date(utcTimeString);
      if (isNaN(utcDateTime.getTime())) return 'Invalid date';
      
      const philippineDateTime = this.fromUtc(utcDateTime);
      return this.formatDateShort(philippineDateTime);
    } catch (e) {
      return 'Invalid date';
    }
  }

  /**
   * Convert database timestamp to Philippine DateTime object
   */
  static parseDatabaseTime(utcTimeString?: string | null): Date | null {
    if (!utcTimeString) return null;

    try {
      const utcDateTime = new Date(utcTimeString);
      if (isNaN(utcDateTime.getTime())) return null;
      
      return this.fromUtc(utcDateTime);
    } catch (e) {
      return null;
    }
  }

  /**
   * Get Philippine time as ISO string for metadata
   */
  static toPhilippineIsoString(philippineDateTime: Date): string {
    return philippineDateTime.toISOString();
  }

  /**
   * Check if a date is today in Philippine time
   */
  static isToday(philippineDateTime: Date): boolean {
    const today = this.now();
    return philippineDateTime.getFullYear() === today.getFullYear() &&
           philippineDateTime.getMonth() === today.getMonth() &&
           philippineDateTime.getDate() === today.getDate();
  }

  /**
   * Check if a date is yesterday in Philippine time
   */
  static isYesterday(philippineDateTime: Date): boolean {
    const yesterday = new Date(this.now());
    yesterday.setDate(yesterday.getDate() - 1);
    return philippineDateTime.getFullYear() === yesterday.getFullYear() &&
           philippineDateTime.getMonth() === yesterday.getMonth() &&
           philippineDateTime.getDate() === yesterday.getDate();
  }

  /**
   * Get specific time string - always shows full date and time for clarity
   */
  static getSpecificTimeString(philippineDateTime: Date): string {
    return this.formatDateTime(philippineDateTime);
  }

  /**
   * Get relative time string (e.g., "Today 6:05 PM", "Yesterday 3:30 PM", "June 3, 2025 2:15 PM")
   */
  static getRelativeTimeString(philippineDateTime: Date): string {
    if (this.isToday(philippineDateTime)) {
      return `Today ${this.formatTime(philippineDateTime)}`;
    } else if (this.isYesterday(philippineDateTime)) {
      return `Yesterday ${this.formatTime(philippineDateTime)}`;
    } else {
      return this.formatDateTime(philippineDateTime);
    }
  }

  /**
   * Format time for specific display - always shows full date and time
   */
  static formatSpecificTime(utcTimeString?: string | null): string {
    const philippineTime = this.parseDatabaseTime(utcTimeString);
    if (!philippineTime) return 'Unknown time';

    return this.getSpecificTimeString(philippineTime);
  }

  /**
   * Format time for relative display (Today/Yesterday vs full date)
   */
  static formatRelativeTime(utcTimeString?: string | null): string {
    const philippineTime = this.parseDatabaseTime(utcTimeString);
    if (!philippineTime) return 'Unknown time';

    return this.getRelativeTimeString(philippineTime);
  }

  /**
   * Format time for case analytics and tables (short format)
   */
  static formatTableTime(utcTimeString?: string | null): string {
    if (!utcTimeString) return 'N/A';

    try {
      const utcDateTime = new Date(utcTimeString);
      if (isNaN(utcDateTime.getTime())) return 'Invalid';
      
      const philippineDateTime = this.fromUtc(utcDateTime);
      
      // Use short format for table display
      return philippineDateTime.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid';
    }
  }

  /**
   * Get timezone offset string (e.g., "UTC+8" or "GMT+8")
   */
  static getTimezoneString(): string {
    return 'UTC+8';
  }

  /**
   * Get timezone display name
   */
  static getTimezoneDisplayName(): string {
    return 'Philippine Standard Time (PST)';
  }
}

// Export default instance for convenient usage
export default PhilippineTime;