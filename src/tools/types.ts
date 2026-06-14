import type { Component } from 'vue';

export enum Category {
  DATA_PROCESSING = 'data-processing',
  ENCODING = 'encoding',
  TIME_ID = 'time-id',
  SECURITY = 'security',
  GENERATION = 'generation',
  LLM = 'llm',
}

export interface ToolShareState {
  [key: string]: unknown;
}

export interface Tool {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
  readonly route: string;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly component: () => Promise<Component>;
  readonly encodeShareState?: (state: ToolShareState) => string;
  readonly decodeShareState?: (encoded: string) => ToolShareState;
}
