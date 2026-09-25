import { PRODUCT_CATEGORIES } from '@/constants/categories';

export const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((cat) => ({
  value: cat.slug,
  label: cat.name
}));
