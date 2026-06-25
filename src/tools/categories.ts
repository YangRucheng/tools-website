import { Category } from './types';

export interface CategoryMeta {
  label: string;
  order: number;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  [Category.ENCODING]: { label: '编解码', order: 0 },
  [Category.GENERATION]: { label: '生成器', order: 1 },
  [Category.NETWORK]: { label: '网络工具', order: 2 },
  [Category.MORE]: { label: '更多工具', order: 3 },
};

export const ORDERED_CATEGORIES: Category[] = (
  Object.entries(CATEGORY_META) as [Category, CategoryMeta][]
)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([cat]) => cat);
