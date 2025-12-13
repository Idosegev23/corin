export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  link: string;
  shortLink: string;
  couponCode?: string;
  image?: string;
  description?: string;
}

export interface Post {
  id: string;
  url: string;
  caption: string;
  brand?: string;
  likes?: number;
  image?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  url: string;
  image?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'מעיל טדי',
    brand: 'Addict',
    category: 'אופנה',
    link: 'https://addictonline.co.il/TEDDY_COAT_CORIN_',
    shortLink: 'https://linkg.pt/s/w4b6bmk3',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
  },
  {
    id: '2',
    name: 'סריג אוסטין',
    brand: 'Addict',
    category: 'אופנה',
    link: 'https://addictonline.co.il/AUSTIN_KNIT_CORIN_',
    shortLink: 'https://linkg.pt/s/j408tz04',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
  },
  {
    id: '3',
    name: 'בלייזר אנאבל',
    brand: 'Addict',
    category: 'אופנה',
    link: 'https://addictonline.co.il/ANABELLE_BLAZER_CORIN_',
    shortLink: 'https://linkg.pt/s/54dj1o0o',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
  },
  {
    id: '4',
    name: 'Philips Sonicare - הלבנת שיניים',
    brand: 'Philips',
    category: 'טכנולוגיה',
    link: 'https://cpb.co.il/philips-sonicare/',
    shortLink: 'https://linkg.pt/s/vs79l2vo',
    couponCode: 'CORRINSONI',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
  },
  {
    id: '5',
    name: 'Philips Lumea IPL 9900',
    brand: 'Philips',
    category: 'טכנולוגיה',
    link: 'https://cpb.co.il/product/philips-lumea-ipl-9900-series/',
    shortLink: 'https://linkg.pt/s/n38hegy5',
    couponCode: 'corrin9900',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
  },
  {
    id: '6',
    name: 'קרם שיזוף עצמי הדרגתי',
    brand: 'Dove',
    category: 'טיפוח',
    link: 'https://shop.super-pharm.co.il/',
    shortLink: 'https://linkg.pt/s/eylyiko7',
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400',
  },
  {
    id: '7',
    name: 'BOBOT MegaPro - מיקסר',
    brand: 'BOBOT',
    category: 'בית',
    link: 'https://bobot-israel.com/',
    shortLink: 'https://linkg.pt/s/8b46gnmh',
    couponCode: 'corrin20',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
  },
  {
    id: '8',
    name: 'פאפא ג\'ונס פיצה',
    brand: 'Papa Johns',
    category: 'אוכל',
    link: 'https://www.papajohns.co.il/shop/',
    shortLink: 'https://linkg.pt/s/d7rsc8jo',
    couponCode: 'CG10',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
  {
    id: '9',
    name: 'ארגובייבי כיסא אוכל',
    brand: 'Ergobaby',
    category: 'תינוקות',
    link: 'https://cpb.co.il/product-category/ergobaby/',
    shortLink: 'https://linkg.pt/s/l5rkxw2a',
    couponCode: 'CORRIN20',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
  },
  {
    id: '10',
    name: 'Erborian קרם CC',
    brand: 'Erborian',
    category: 'טיפוח',
    link: 'https://il.erborian.com/',
    shortLink: 'https://linkg.pt/s/6mj0mt7k',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  },
  {
    id: '11',
    name: 'Wolt - משלוחים',
    brand: 'Wolt',
    category: 'שירותים',
    link: 'https://wolt.com/',
    shortLink: '',
    couponCode: 'CORRIN60',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400',
  },
  {
    id: '12',
    name: 'אופטיקנה - משקפיים',
    brand: 'אופטיקנה',
    category: 'אופטיקה',
    link: 'https://www.opticana.co.il/',
    shortLink: '',
    couponCode: 'CORRING10',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
  },
];

export const posts: Post[] = [
  {
    id: '1',
    url: 'https://www.instagram.com/p/DSFWvS0DbNO/',
    caption: 'הכי סמלי בעולם להשיק משזפים ביתיים ביום של סופה... תודה ל @dove ואשכרה דאב!!!! עם היונה שבחרו בי להוביל את הקמפיין',
    brand: 'Dove',
    likes: 1430,
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400',
  },
  {
    id: '2',
    url: 'https://www.instagram.com/p/DRz20p7DcdS/',
    caption: 'רגע של אושר עם המשפחה',
    likes: 2692,
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
  },
  {
    id: '3',
    url: 'https://www.instagram.com/p/DRhvx5PDc3J/',
    caption: 'סטייל חורפי עם אדיקט',
    brand: 'Addict',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
  },
  {
    id: '4',
    url: 'https://www.instagram.com/p/DRNKJJxjZPb/',
    caption: 'הלוק המושלם לחורף',
    brand: 'Addict',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
  },
  {
    id: '5',
    url: 'https://www.instagram.com/p/DQ4kfy5DQ7D/',
    caption: 'טיפוח עור הפנים עם Erborian',
    brand: 'Erborian',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  },
  {
    id: '6',
    url: 'https://www.instagram.com/p/DQmfjyDDeYI/',
    caption: 'ארוחה משפחתית מושלמת',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
];

export const couponCodes = [
  { code: 'CORRINSONI', brand: 'Philips Sonicare', description: 'מברשות שיניים' },
  { code: 'CG10', brand: 'פאפא ג\'ונס', description: 'פיצה' },
  { code: 'CORRIN20', brand: 'ארגובייבי', description: 'כיסא אוכל' },
  { code: 'corrin9900', brand: 'Philips Lumea', description: 'הסרת שיער' },
  { code: 'corrin20', brand: 'BOBOT', description: 'מיקסר' },
  { code: 'CORRING10', brand: 'אופטיקנה', description: 'משקפיים' },
  { code: 'CORRIN60', brand: 'Wolt', description: 'משלוחים' },
  { code: 'WELLA25', brand: 'Wella', description: 'מוצרי שיער' },
];

export const categories = [
  { id: 'all', name: 'הכל' },
  { id: 'fashion', name: 'אופנה' },
  { id: 'beauty', name: 'טיפוח' },
  { id: 'tech', name: 'טכנולוגיה' },
  { id: 'food', name: 'אוכל' },
  { id: 'home', name: 'בית' },
  { id: 'recipes', name: 'מתכונים' },
];

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'צלעות טלה לימוניות',
    description: 'מנה חגיגית ומרשימה - טוחנים רוטב בבלנדר, מכניסים לתנור וזהו!',
    ingredients: [
      'גרידת לימון מ-2 לימונים',
      'מיץ לימון מ-2 לימונים',
      '3 שיני שום',
      'ענף רוזמרין',
      '3 ענפי טימין',
      'כף גדושה חרדל',
      '2 כפות גדושות דבש',
      'רבע כוס יין לבן',
      '1 קילו צלעות טלה (8 יח׳)',
      'כפית מלח',
      'חצי כפית פלפל שחור',
      'חצי כפית אורגנו יבש',
    ],
    instructions: 'מחממים תנור ל-180 מעלות. בבלנדר טוחנים את כל מרכיבי הרוטב. מתבלים את הצלעות, מניחים על הרוטב ואופים שעה ו-20 דקות.',
    url: 'https://www.instagram.com/p/DIHD8iqN4ui/',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
  },
  {
    id: '2',
    name: 'עוגת גבינה קלילה בקערה',
    description: 'לא מתוקה מדי, פשוט אוכלים עם כפית ואי אפשר להפסיק!',
    ingredients: [
      'כוס סוכר',
      '2 סוכר וניל',
      'רבע כוס קמח תפו״א',
      'קילו גבינה לבנה',
      '5 ביצים',
      '4 שמנת חמוצה לטופינג',
    ],
    instructions: 'מערבבים את כל המרכיבים, מוזגים לתבנית ואופים 50 דקות. מוסיפים שמנת ומחזירים ל-20 דקות נוספות.',
    url: 'https://www.instagram.com/p/DIazrV1tcZY/',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
  },
  {
    id: '3',
    name: 'פיצה ללא לישה',
    description: 'מהמתכונים שילוו אתכם כל החיים - ללא לישה וללא התפחה!',
    ingredients: [
      '2 כוסות קמח תופח',
      '2 כוסות גבינה צהובה מגורדת',
      '1.5 כוס מים',
      'כפית שטוחה מלח',
      'רוטב פיצה',
    ],
    instructions: 'מערבבים את הבצק, משטחים על תבנית, מוסיפים רוטב וגבינה ואופים 160 מעלות 30-40 דקות.',
    url: 'https://www.instagram.com/p/DDaCePJNZkk/',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
  {
    id: '4',
    name: 'גבינה פירורים',
    description: 'העוגה האהובה עליי - מושלמת לחג או סתם ככה!',
    ingredients: [
      '200 גרם חמאה קרה',
      'חצי כוס סוכר',
      '2 כוסות קמח תופח',
      '3 חלמונים',
      '2 מיכלי שמנת מתוקה',
      '500 גרם גבינה לבנה 5%',
    ],
    instructions: 'מכינים בצק פריך, אופים 2/3 בתבנית ו-1/3 לפירורים. מכינים קרם שמנת וגבינה ומפזרים פירורים.',
    url: 'https://www.instagram.com/p/DKKcknENdAM/',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
  },
  {
    id: '5',
    name: 'פירה פרווה טעים',
    description: 'מיונז טוב זה כל מה שאתם צריכים לפירה פרווה מושלם!',
    ingredients: [
      '5 תפו״א גדולים',
      'כפית מלח',
      '2 כפות גדושות מיונז',
    ],
    instructions: 'מבשלים את תפוחי האדמה, מסננים, מועכים ומוסיפים מיונז ומלח.',
    url: 'https://www.instagram.com/p/DG01WAntHLd/',
    image: 'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?w=400',
  },
  {
    id: '6',
    name: 'עוף בקרם קוקוס',
    description: 'פילה עוף ברוטב קרמי של קוקוס, סויה וחמאת בוטנים',
    ingredients: [
      'פילה עוף',
      'קרם קוקוס',
      'סויה',
      'חמאת בוטנים',
      'בצל ירוק',
    ],
    instructions: 'חותכים את הפילה לריבועים, מטגנים להשחמה. מוסיפים קרם קוקוס, סויה וחמאת בוטנים ומצמצמים 20 דקות.',
    url: 'https://www.instagram.com/p/DJo_Qavt4hg/',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
  },
];

