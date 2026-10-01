import {
  PRODUCT_CATEGORIES,
  getSubcategoriesByCategory,
  getSubSubcategories
} from '@/constants/categories';

export const categoryOptions = PRODUCT_CATEGORIES.map((cat) => ({
  value: cat.slug,
  label: `${cat.name}`
}));

export function getSubcategoryOptions(categorySlug: string) {
  if (!categorySlug) return [];
  const subs = getSubcategoriesByCategory(categorySlug);
  return subs.map((sub) => ({
    value: sub.slug,
    label: sub.name
  }));
}

export function getSubSubcategoryOptions(categorySlug: string, subcategorySlug: string) {
  if (!categorySlug || !subcategorySlug) return [];
  const subSubs = getSubSubcategories(categorySlug, subcategorySlug);
  return subSubs.map((ss) => ({
    value: ss.slug,
    label: ss.name
  }));
}
