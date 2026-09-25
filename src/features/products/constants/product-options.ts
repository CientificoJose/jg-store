import { PRODUCT_CATEGORIES } from '@/constants/categories';

export const categoryOptions = PRODUCT_CATEGORIES.map((cat) => ({
  value: cat.slug,
  label: `${cat.name} (${cat.id})`
}));
