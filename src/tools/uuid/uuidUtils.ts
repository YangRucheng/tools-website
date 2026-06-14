export type UuidVersion = 'v1' | 'v4';

/**
 * Generate a single UUID v4 using crypto.randomUUID().
 */
export const generateUuidV4 = (): string => crypto.randomUUID();

/**
 * Generate a single UUID v1 (time-based).
 * Uses timestamp + random clock sequence + random node (no MAC access in browser).
 */
export const generateUuidV1 = (): string => {
  // Timestamp: 100-nanosecond intervals since 1582-10-15 00:00:00 UTC
  const dt = Date.now() + 12219292800000; // offset from Unix epoch to UUID epoch
  const ts = Math.floor(dt * 10000); // convert to 100ns intervals

  // Split into time_low (32 bits), time_mid (16 bits), time_hi (12 bits)
  const timeLow = (ts & 0xffffffff) >>> 0;
  const timeMid = ((ts / 0x100000000) & 0xffff) >>> 0;
  const timeHi = ((ts / 0x1000000000000) & 0x0fff) >>> 0;

  // Version 1
  const timeHiAndVersion = (timeHi | 0x1000) >>> 0;

  // Clock sequence: random 14 bits
  const clockSeq = (Math.floor(Math.random() * 0x4000)) >>> 0;
  const clockSeqHi = ((clockSeq >> 8) & 0x3f) | 0x80; // variant 10xx
  const clockSeqLow = clockSeq & 0xff;

  // Node: random 48 bits
  const node = new Uint8Array(6);
  crypto.getRandomValues(node);

  const toHex = (val: number, len: number): string =>
    val.toString(16).padStart(len, '0');

  return [
    toHex(timeLow, 8),
    toHex(timeMid, 4),
    toHex(timeHiAndVersion, 4),
    toHex(clockSeqHi, 2) + toHex(clockSeqLow, 2),
    Array.from(node).map((b) => toHex(b, 2)).join(''),
  ].join('-');
};

/** v4 validation pattern */
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** v1 validation pattern (version=1, variant=10xx) */
const UUID_V1_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const generateUuids = (count: number, version: UuidVersion = 'v4'): string[] =>
  Array.from({ length: count }, () =>
    version === 'v1' ? generateUuidV1() : generateUuidV4(),
  );

export const validateUuid = (uuid: string, version?: UuidVersion): boolean => {
  if (version === 'v1') return UUID_V1_RE.test(uuid);
  if (version === 'v4') return UUID_V4_RE.test(uuid);
  return UUID_V4_RE.test(uuid) || UUID_V1_RE.test(uuid);
};

export const formatUuid = (uuid: string, uppercase: boolean, noDashes: boolean): string => {
  let result = uuid;
  if (noDashes) result = result.replace(/-/g, '');
  if (uppercase) result = result.toUpperCase();
  return noDashes ? result : (uppercase ? result : result.toLowerCase());
};
