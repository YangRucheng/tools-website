import { ref, watch, type Ref } from 'vue';
import { storage } from '@/utils/storage';

const STORAGE_PREFIX = 'tool-state:';

/**
 * Per-tool persistent state backed by localStorage.
 * Auto-saves on change. Exposes a clear() to reset to defaults.
 */
export const useToolStorage = <T extends Record<string, unknown>,>(
  toolId: string,
  defaults: T,
): { [K in keyof T]: Ref<T[K]> } & { clear: () => void } => {
  const key = STORAGE_PREFIX + toolId;
  const saved = storage.get<Partial<T>>(key, {});

  const refs = {} as Record<string, Ref>;
  const defaultKeys = Object.keys(defaults) as (keyof T)[];

  // Create a reactive ref for each field, preferring saved value
  for (const k of defaultKeys) {
    const initial = (saved[k] !== undefined ? saved[k] : defaults[k]) as T[typeof k];
    refs[k as string] = ref(initial);
  }

  // Auto-save all fields to localStorage on change
  const save = () => {
    const data: Partial<T> = {};
    for (const k of defaultKeys) {
      data[k] = refs[k as string].value;
    }
    storage.set(key, data);
  };

  const watched = defaultKeys.map((k) => refs[k as string]);
  watch(watched, save, { deep: false });

  const clear = () => {
    for (const k of defaultKeys) {
      refs[k as string].value = defaults[k];
    }
    storage.remove(key);
  };

  // Return object with typed refs + clear
  const result = { clear } as Record<string, unknown>;
  for (const k of defaultKeys) {
    result[k as string] = refs[k as string];
  }
  return result as { [K in keyof T]: Ref<T[K]> } & { clear: () => void };
}
