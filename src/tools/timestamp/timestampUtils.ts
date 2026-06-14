import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(relativeTime);

export interface TimestampInfo {
  unixSeconds: number;
  unixMillis: number;
  utc: string;
  local: string;
  iso8601: string;
  relative: string;
}

export const timestampToDate = (ts: number): TimestampInfo => {
  // Auto-detect seconds vs milliseconds
  const millis = ts < 1e12 ? ts * 1000 : ts;
  const d = dayjs(millis);
  return {
    unixSeconds: Math.floor(millis / 1000),
    unixMillis: millis,
    utc: d.utc().format('YYYY-MM-DD HH:mm:ss UTC'),
    local: d.format('YYYY-MM-DD HH:mm:ss'),
    iso8601: d.toISOString(),
    relative: d.fromNow(),
  };
};

export const dateToTimestamp = (dateStr: string): { success: true; data: number } | { success: false; error: string } => {
  if (!dateStr.trim()) return { success: false, error: '输入为空' };
  const d = dayjs(dateStr.trim());
  if (!d.isValid()) return { success: false, error: '无效的日期格式' };
  return { success: true, data: d.unix() };
};

export const getCurrentTimestamp = (): number => Math.floor(Date.now() / 1000);

export const formatTimestampOutput = (info: TimestampInfo): string => {
  return [
    `Unix 秒:     ${info.unixSeconds}`,
    `Unix 毫秒:   ${info.unixMillis}`,
    `UTC 时间:    ${info.utc}`,
    `本地时间:    ${info.local}`,
    `ISO 8601:    ${info.iso8601}`,
    `相对时间:    ${info.relative}`,
  ].join('\n');
};
