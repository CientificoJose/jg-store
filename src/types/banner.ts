export type CarouselActionType = 'explore' | 'category' | 'wholesale' | 'whatsapp';

export interface CarouselSlide {
  id: string;
  tag: string;
  tagColor?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  image: string;
  primaryActionLabel: string;
  primaryActionType: CarouselActionType;
  categorySlug?: string;
  secondaryActionLabel: string;
  secondaryActionType: CarouselActionType;
  features: string[];
  isActive?: boolean;
  displayOrder?: number;
}

export interface BannerDbRow {
  id: string;
  tag: string;
  tag_color?: string;
  title: string;
  title_accent?: string;
  subtitle: string;
  image_url: string;
  primary_action_label: string;
  primary_action_type: CarouselActionType;
  category_slug?: string;
  secondary_action_label: string;
  secondary_action_type: CarouselActionType;
  features: string[] | string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export function mapDbRowToSlide(row: BannerDbRow): CarouselSlide {
  let parsedFeatures: string[] = [];
  if (Array.isArray(row.features)) {
    parsedFeatures = row.features;
  } else if (typeof row.features === 'string') {
    try {
      parsedFeatures = JSON.parse(row.features);
    } catch {
      parsedFeatures = row.features.split(',').map((f) => f.trim()).filter(Boolean);
    }
  }

  return {
    id: row.id,
    tag: row.tag || '',
    tagColor: row.tag_color || '#E63946',
    title: row.title || '',
    titleAccent: row.title_accent || '',
    subtitle: row.subtitle || '',
    image: row.image_url || '',
    primaryActionLabel: row.primary_action_label || 'Explorar Catálogo',
    primaryActionType: row.primary_action_type || 'explore',
    categorySlug: row.category_slug || '',
    secondaryActionLabel: row.secondary_action_label || 'Cotizar por WhatsApp',
    secondaryActionType: row.secondary_action_type || 'whatsapp',
    features: parsedFeatures,
    isActive: row.is_active !== false,
    displayOrder: row.display_order ?? 0
  };
}

export function mapSlideToDbRow(slide: CarouselSlide): BannerDbRow {
  return {
    id: slide.id,
    tag: slide.tag,
    tag_color: slide.tagColor || '#E63946',
    title: slide.title,
    title_accent: slide.titleAccent || '',
    subtitle: slide.subtitle || '',
    image_url: slide.image,
    primary_action_label: slide.primaryActionLabel || 'Explorar Catálogo',
    primary_action_type: slide.primaryActionType || 'explore',
    category_slug: slide.categorySlug || '',
    secondary_action_label: slide.secondaryActionLabel || 'Cotizar por WhatsApp',
    secondary_action_type: slide.secondaryActionType || 'whatsapp',
    features: slide.features || [],
    is_active: slide.isActive !== false,
    display_order: slide.displayOrder ?? 0
  };
}
