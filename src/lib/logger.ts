export enum LogType {
  DOWNLOAD = 'DOWNLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  DESIGN_EXPORT = 'DESIGN_EXPORT',
  NID_GENERATE = 'NID_GENERATE',
  PASSPORT_GENERATE = 'PASSPORT_GENERATE',
  QR_GENERATE = 'QR_GENERATE',
  ENCRYPTION = 'ENCRYPTION',
  PAGE_VIEW = 'PAGE_VIEW',
  ERROR = 'ERROR'
}

export interface LogEvent {
  type: LogType;
  tool: string;
  details?: any;
}

export async function logEvent(event: LogEvent, userId: string = 'anonymous') {
  try {
    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, userId })
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to log event:', err);
    return false;
  }
}
