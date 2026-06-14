import { Category } from './types';

export interface CategoryMeta {
  label: string;
  order: number;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  [Category.DATA_PROCESSING]: { label: '数据处理', order: 0 },
  [Category.ENCODING]: { label: '编码转换', order: 1 },
  [Category.TIME_ID]: { label: '时间与标识', order: 2 },
  [Category.SECURITY]: { label: '安全与令牌', order: 3 },
  [Category.GENERATION]: { label: '生成工具', order: 4 },
  [Category.LLM]: { label: '大模型', order: 5 },
};

export const ORDERED_CATEGORIES: Category[] = (
  Object.entries(CATEGORY_META) as [Category, CategoryMeta][]
)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([cat]) => cat);
