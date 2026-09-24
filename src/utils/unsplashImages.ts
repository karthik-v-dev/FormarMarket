import { ProductCategory } from '../types';

export interface UnsplashPreset {
  label: string;
  category: ProductCategory;
  url: string;
  keyword: string;
}

export const CATEGORY_FALLBACK_IMAGES: Record<ProductCategory, string> = {
  leafy_greens: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  veggies: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80',
  rice_bags: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  organic_specials: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
};

export const UNSPLASH_PRESETS: UnsplashPreset[] = [
  // Leafy Greens
  {
    label: 'Palak (Spinach Bunch)',
    category: 'leafy_greens',
    url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    keyword: 'spinach, leafy green, fresh palak',
  },
  {
    label: 'Fresh Coriander (Kothmir)',
    category: 'leafy_greens',
    url: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
    keyword: 'coriander leaves, cilantro herbs',
  },
  {
    label: 'Fresh Mint (Pudina)',
    category: 'leafy_greens',
    url: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80',
    keyword: 'mint leaves, garden herb',
  },
  {
    label: 'Organic Methi (Fenugreek)',
    category: 'leafy_greens',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    keyword: 'methi leaves, organic greens',
  },

  // Fresh Veggies
  {
    label: 'Country Tomatoes (Tamatar)',
    category: 'veggies',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    keyword: 'fresh red tomatoes, vine ripe',
  },
  {
    label: 'Red Onions (Nashik Pyaz)',
    category: 'veggies',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    keyword: 'red onions, fresh bulbs',
  },
  {
    label: 'Baby Potatoes (Aloo)',
    category: 'veggies',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    keyword: 'farm potatoes, fresh harvest',
  },
  {
    label: 'Crisp Green Capsicum',
    category: 'veggies',
    url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    keyword: 'bell pepper, green capsicum',
  },
  {
    label: 'Orange Mountain Carrots',
    category: 'veggies',
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    keyword: 'fresh carrots, crunchy roots',
  },

  // Organic Rice Bags
  {
    label: 'Royal Basmati Rice (5kg Bag)',
    category: 'rice_bags',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    keyword: 'basmati rice, grain sack',
  },
  {
    label: 'Sona Masoori Raw Rice (10kg)',
    category: 'rice_bags',
    url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
    keyword: 'sona masoori white rice bag',
  },
  {
    label: 'Organic Brown Rice (5kg)',
    category: 'rice_bags',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    keyword: 'brown rice, whole grain',
  },

  // Pure Organic Specials
  {
    label: 'Wood-Pressed Coconut Oil (1L)',
    category: 'organic_specials',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    keyword: 'coconut oil, cold pressed',
  },
  {
    label: 'Wild Forest Raw Honey (500g)',
    category: 'organic_specials',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    keyword: 'pure honey jar, organic bee honey',
  },
  {
    label: 'Organic Lakadong Turmeric',
    category: 'organic_specials',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    keyword: 'haldi turmeric powder, organic roots',
  },
];

/**
 * Returns safe image URL with fallback to appropriate category default
 */
export function getProductImageUrl(url?: string | null, category?: ProductCategory): string {
  if (url && typeof url === 'string' && url.trim().startsWith('http')) {
    return url.trim();
  }
  if (category && CATEGORY_FALLBACK_IMAGES[category]) {
    return CATEGORY_FALLBACK_IMAGES[category];
  }
  return CATEGORY_FALLBACK_IMAGES.veggies;
}
