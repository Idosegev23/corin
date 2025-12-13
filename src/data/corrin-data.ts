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
  shortcode: string;
  url: string;
  caption: string;
  brand?: string;
  date?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  url: string;
  shortcode: string;
}

// Products with real links
export const products: Product[] = [
  {
    id: '1',
    name: 'מעיל טדי',
    brand: 'Addict',
    category: 'אופנה',
    link: 'https://addictonline.co.il/TEDDY_COAT_CORIN_',
    shortLink: 'https://linkg.pt/s/w4b6bmk3',
  },
  {
    id: '2',
    name: 'סריג אוסטין',
    brand: 'Addict',
    category: 'אופנה',
    link: 'https://addictonline.co.il/AUSTIN_KNIT_CORIN_',
    shortLink: 'https://linkg.pt/s/j408tz04',
  },
  {
    id: '3',
    name: 'בלייזר אנאבל',
    brand: 'Addict',
    category: 'אופנה',
    link: 'https://addictonline.co.il/ANABELLE_BLAZER_CORIN_',
    shortLink: 'https://linkg.pt/s/54dj1o0o',
  },
  {
    id: '4',
    name: 'Philips Sonicare - הלבנת שיניים',
    brand: 'Philips',
    category: 'טכנולוגיה',
    link: 'https://cpb.co.il/philips-sonicare/',
    shortLink: 'https://linkg.pt/s/vs79l2vo',
    couponCode: 'CORRINSONI',
  },
  {
    id: '5',
    name: 'Philips Lumea IPL 9900',
    brand: 'Philips',
    category: 'טכנולוגיה',
    link: 'https://cpb.co.il/product/philips-lumea-ipl-9900-series/',
    shortLink: 'https://linkg.pt/s/n38hegy5',
    couponCode: 'corrin9900',
  },
  {
    id: '6',
    name: 'קרם שיזוף עצמי הדרגתי',
    brand: 'Dove',
    category: 'טיפוח',
    link: 'https://shop.super-pharm.co.il/',
    shortLink: 'https://linkg.pt/s/eylyiko7',
  },
  {
    id: '7',
    name: 'BOBOT MegaPro - מיקסר',
    brand: 'BOBOT',
    category: 'בית',
    link: 'https://bobot-israel.com/',
    shortLink: 'https://linkg.pt/s/8b46gnmh',
    couponCode: 'corrin20',
  },
  {
    id: '8',
    name: 'פאפא ג\'ונס פיצה',
    brand: 'Papa Johns',
    category: 'אוכל',
    link: 'https://www.papajohns.co.il/shop/',
    shortLink: 'https://linkg.pt/s/d7rsc8jo',
    couponCode: 'CG10',
  },
  {
    id: '9',
    name: 'ארגובייבי כיסא אוכל',
    brand: 'Ergobaby',
    category: 'תינוקות',
    link: 'https://cpb.co.il/product-category/ergobaby/',
    shortLink: 'https://linkg.pt/s/l5rkxw2a',
    couponCode: 'CORRIN20',
  },
  {
    id: '10',
    name: 'Erborian קרם CC',
    brand: 'Erborian',
    category: 'טיפוח',
    link: 'https://il.erborian.com/',
    shortLink: 'https://linkg.pt/s/6mj0mt7k',
  },
  {
    id: '11',
    name: 'Wolt - משלוחים',
    brand: 'Wolt',
    category: 'שירותים',
    link: 'https://wolt.com/',
    shortLink: '',
    couponCode: 'CORRIN60',
  },
  {
    id: '12',
    name: 'אופטיקנה - משקפיים',
    brand: 'אופטיקנה',
    category: 'אופטיקה',
    link: 'https://www.opticana.co.il/',
    shortLink: '',
    couponCode: 'CORRING10',
  },
];

// Real Instagram posts with shortcodes
export const posts: Post[] = [
  {
    id: '1',
    shortcode: 'DSFWvS0DbNO',
    url: 'https://www.instagram.com/p/DSFWvS0DbNO/',
    caption: 'הכי סמלי בעולם להשיק משזפים ביתיים ביום של סופה. תודה ל Dove שבחרו בי להוביל את הקמפיין',
    brand: 'Dove',
    date: '2025-12-10',
  },
  {
    id: '2',
    shortcode: 'DRz20p7DcdS',
    url: 'https://www.instagram.com/p/DRz20p7DcdS/',
    caption: 'צ׳ולנט לשבת - בשביל לאכול בשבת, משרים בחמישי בערב את השעועית',
    date: '2025-12-03',
  },
  {
    id: '3',
    shortcode: 'DR7Z0uyjTYs',
    url: 'https://www.instagram.com/p/DR7Z0uyjTYs/',
    caption: 'מסקנה: צאו לבלות',
    date: '2025-12-06',
  },
  {
    id: '4',
    shortcode: 'DRuphn2DRDI',
    url: 'https://www.instagram.com/p/DRuphn2DRDI/',
    caption: 'בידיים מלאות ובעגלה מלאה',
    date: '2025-12-01',
  },
  {
    id: '5',
    shortcode: 'DRhvx5PDc3J',
    url: 'https://www.instagram.com/p/DRhvx5PDc3J/',
    caption: 'מתכון למאפינס שוקולד צ׳יפס - קלים ומהנים',
    date: '2025-11-28',
  },
  {
    id: '6',
    shortcode: 'DRXbvSODcwz',
    url: 'https://www.instagram.com/p/DRXbvSODcwz/',
    caption: 'לא היית ביוון אם לא העלית תמונה של סלט יווני',
    date: '2025-11-22',
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

// Real recipes from Instagram with shortcodes
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
      '1 קילו צלעות טלה',
      'כפית מלח',
      'חצי כפית פלפל שחור',
    ],
    instructions: 'מחממים תנור ל-180 מעלות. בבלנדר טוחנים את כל מרכיבי הרוטב. מתבלים את הצלעות, מניחים על הרוטב ואופים שעה ו-20 דקות.',
    url: 'https://www.instagram.com/p/DIHD8iqN4ui/',
    shortcode: 'DIHD8iqN4ui',
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
    shortcode: 'DIazrV1tcZY',
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
    shortcode: 'DDaCePJNZkk',
  },
  {
    id: '4',
    name: 'גבינה פירורים',
    description: 'העוגה האהובה עליי - מושלמת לחג או סתם ככה! שישה מרכיבים בלבד',
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
    shortcode: 'DKKcknENdAM',
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
    shortcode: 'DG01WAntHLd',
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
    shortcode: 'DJo_Qavt4hg',
  },
  {
    id: '7',
    name: 'קראמבל תפוחים',
    description: 'קינוח חורפי מושלם - מכינים ישר לתוך התבנית בלי ללכלך כלים!',
    ingredients: [
      'כוס וחצי קמח תופח',
      'חצי כוס סוכר חום',
      '150 גרם חמאה',
      '4 תפוחים ירוקים',
      'קינמון',
    ],
    instructions: 'מחממים תנור ל-180. מכינים בצק פירורי, חותכים תפוחים, מערבבים עם סוכר וקינמון, מפזרים פירורים ואופים חצי שעה.',
    url: 'https://www.instagram.com/p/DQHiN0LDIHm/',
    shortcode: 'DQHiN0LDIHm',
  },
  {
    id: '8',
    name: 'חלה מושלמת',
    description: 'מתכון של ניסי גולדרייך - החלה הקבועה שהפכה למתכון של כל כך הרבה בתים!',
    ingredients: [
      '500 מ״ל מים חמימים',
      '2 כפות שמרים יבשים',
      'קילו קמח מנופה',
      'חצי כוס סוכר',
      '3/4 כוס שמן',
      'כף מלח',
      'ביצה, שומשום',
    ],
    instructions: 'מערבבים מים ושמרים, מוסיפים קמח סוכר ושמן, לשים 10 דקות, מתפיחים שעה-שעתיים, קולעים ואופים 200 מעלות 20-30 דקות.',
    url: 'https://www.instagram.com/p/DObgpG-jY8K/',
    shortcode: 'DObgpG-jY8K',
  },
];
