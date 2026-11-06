/**
 * Realbeber & Co. - Confirmed Product Catalog
 * Strictly four confirmed varieties: Mango, Chikku (Sapodilla), Jackfruit, Banana
 */

// Import pouch assets so Vite bundles and resolves them in production
import mangoPouch from '../assets/products/mango_clean_pouch.png';
import chikkuPouch from '../assets/products/chikku_clean_pouch.png';
import jackfruitPouch from '../assets/products/jackfruit_clean_pouch.png';
import bananaPouch from '../assets/products/banana_clean_pouch.png';

export const PRODUCTS = [
  {
    id: 'mango-frost-chips',
    name: 'Mango Frost Chips',
    flavor: 'Mango',
    subtitle: 'Sun-ripened, rich honey notes',
    tag: 'BEST SELLER',
    tagColor: '#B45309',
    cardBg: '#FFF0BE',
    pillColor: '#F59E0B',
    accentColor: '#D97706',
    price: 149,
    weight: '35g (from 350g fresh fruit)',
    pouchImage: mangoPouch,
    mockupImage: 'assets/products/mango_mockup.jpg',
    flatPack: 'assets/uploads/mango_pack.jpg',
    description: '100% pure Kerala Alphonso & local mangoes, harvested at peak sun sweetness and freeze-dried at sub-zero temperatures. Retains vibrant golden color, tropical sweetness, and an ethereal melt-in-mouth crunch with zero oil or sugar.',
    badges: ['100% Natural', 'Gluten Free', 'Oil Free', 'Vegan', 'No Added Sugar', 'No Preservatives'],
    nutrition: {
      energy: '128 kcal',
      fruitEquivalent: '1 whole mango',
      protein: '1.2g',
      fat: '0.1g',
      carbs: '29g',
      sugars: '24g (Natural Fruit Fructose)'
    },
    ingredients: '100% Fresh Ripe Mango. Nothing else.',
    origin: 'Palakkad & Malappuram, Kerala'
  },
  {
    id: 'chikku-frost-chips',
    name: 'Chikku Frost Chips',
    flavor: 'Chikku (Sapodilla)',
    subtitle: 'Caramel malt fudge sweetness',
    tag: 'NEW',
    tagColor: '#047857',
    cardBg: '#D4EDE2',
    pillColor: '#10B981',
    accentColor: '#059669',
    price: 139,
    weight: '40g (from 400g fresh fruit)',
    pouchImage: chikkuPouch,
    mockupImage: 'assets/products/chikku_mockup.jpg',
    flatPack: 'assets/uploads/chikku_pack.jpg',
    description: 'Velvety sapodilla (chikku) freeze-dried into airy honeycomb slices. Delivers warm notes of brown sugar, caramel malt, and roasted honey with a delicate crumbly crunch that dissolves into pure fruit puree on your palate.',
    badges: ['100% Natural', 'Gluten Free', 'Oil Free', 'Vegan', 'No Added Sugar', 'No Preservatives'],
    nutrition: {
      energy: '136 kcal',
      fruitEquivalent: '3 whole chikkus',
      protein: '0.9g',
      fat: '0.2g',
      carbs: '31g',
      sugars: '26g (Natural Fruit Fructose)'
    },
    ingredients: '100% Fresh Kerala Chikku (Sapodilla). Nothing else.',
    origin: 'Kasaragod & Kannur, Kerala'
  },
  {
    id: 'jackfruit-frost-chips',
    name: 'Jackfruit Frost Chips',
    flavor: 'Jackfruit',
    subtitle: 'Sweet, tropical golden petals',
    tag: 'BEST SELLER',
    tagColor: '#B45309',
    cardBg: '#FED0C7',
    pillColor: '#EF4444',
    accentColor: '#DC2626',
    price: 149,
    weight: '35g (from 350g fresh fruit)',
    pouchImage: jackfruitPouch,
    mockupImage: 'assets/products/jackfruit_mockup.jpg',
    flatPack: 'assets/uploads/jackfruit_pack.jpg',
    description: 'The pride of Kerala—firm golden Varikka jackfruit pods freeze-dried into crisp, fragrant shards. Rich in potassium and fiber with an exotic aroma of pineapple and floral honey. Completely oil-free and non-sticky.',
    badges: ['100% Natural', 'Gluten Free', 'Oil Free', 'Vegan', 'No Added Sugar', 'No Preservatives'],
    nutrition: {
      energy: '132 kcal',
      fruitEquivalent: '12 golden pods',
      protein: '1.8g',
      fat: '0.1g',
      carbs: '30g',
      sugars: '23g (Natural Fruit Fructose)'
    },
    ingredients: '100% Ripe Varikka Jackfruit. Nothing else.',
    origin: 'Idukki & Wayanad, Kerala'
  },
  {
    id: 'banana-frost-chips',
    name: 'Banana Frost Chips',
    flavor: 'Banana',
    subtitle: 'Crisp natural crunch, pure Kerala',
    tag: 'CLASSIC',
    tagColor: '#1D4ED8',
    cardBg: '#D0E5F7',
    pillColor: '#3B82F6',
    accentColor: '#2563EB',
    price: 129,
    weight: '40g (from 400g fresh fruit)',
    pouchImage: bananaPouch,
    mockupImage: 'assets/products/banana_mockup.jpg',
    flatPack: 'assets/uploads/banana_pack.jpg',
    description: 'Golden Kerala Nendran & Robusta bananas sliced and sublimated into ultralight, cloud-crisp medallions. A wholesome revelation compared to traditional fried banana chips—zero palm oil, zero salt, 100% wholesome crunch.',
    badges: ['100% Natural', 'Gluten Free', 'Oil Free', 'Vegan', 'No Added Sugar', 'No Preservatives'],
    nutrition: {
      energy: '142 kcal',
      fruitEquivalent: '2 full bananas',
      protein: '1.4g',
      fat: '0.2g',
      carbs: '33g',
      sugars: '22g (Natural Fruit Fructose)'
    },
    ingredients: '100% Fresh Kerala Bananas. Nothing else.',
    origin: 'Thrissur & Kozhikode, Kerala'
  }
];

if (typeof window !== 'undefined') {
  window.PRODUCTS = PRODUCTS;
}


