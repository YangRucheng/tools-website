import type { Component } from 'vue';

export enum Category {
  ENCODING = 'encoding',
  GENERATION = 'generation',
  NETWORK = 'network',
  MORE = 'more',
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
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly encodeShareState?: (state: ToolShareState) => string;
  readonly decodeShareState?: (encoded: string) => ToolShareState;
}
