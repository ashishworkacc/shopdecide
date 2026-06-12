export type Category =
  | 'earbuds' | 'headphones' | 'speakers' | 'smartphones' | 'laptops'
  | 'monitors' | 'tvs' | 'skincare' | 'makeup' | 'supplements'
  | 'fitness_wearables' | 'watches' | 'fragrances' | 'boots'
  | 'denim' | 'spirits' | 'edc' | 'kitchen' | 'handbags'
  | 'fashion' | 'pens' | 'stationery' | 'keyboards' | 'coffee'
  | 'boardgames' | 'general'

export const SUBREDDITS_BY_CATEGORY: Record<string, string[]> = {
  earbuds: ['IndianGaming', 'indianaudiophiles', 'headphones', 'BudgetAudiophile'],
  headphones: ['IndianGaming', 'indianaudiophiles', 'headphones'],
  speakers: ['IndianGaming', 'indianaudiophiles', 'audiophile'],
  smartphones: ['IndianGaming', 'india', 'Android'],
  laptops: ['IndianGaming', 'india', 'SuggestALaptop'],
  skincare: ['IndianSkincareAddicts', 'SkincareAddiction'],
  makeup: ['makeupindia', 'MakeupAddiction'],
  supplements: ['Fitness_India', 'supplements', 'NutritionalScience'],
  fitness_wearables: ['Fitness_India', 'AndroidWear', 'GarminWatches'],
  watches: ['watchesindia', 'Watches', 'WatchHorology'],
  keyboards: ['mkindia', 'MechanicalKeyboards'],
  pens: ['fountainpens', 'pens'],
  stationery: ['stationery', 'notebooks'],
  coffee: ['IndiaCoffee', 'Coffee'],
  spirits: ['indianwhisky', 'whisky'],
  default: ['india', 'OnlineShopping_India', 'frugalmalefashion'],
}

export function detectCategory(query: string): Category {
  const q = query.toLowerCase()
  if (/earbuds?|tws|in.ear|iem/.test(q)) return 'earbuds'
  if (/headphones?|over.ear|on.ear/.test(q)) return 'headphones'
  if (/speaker|soundbar/.test(q)) return 'speakers'
  if (/phone|smartphone|mobile|android|iphone/.test(q)) return 'smartphones'
  if (/laptop|notebook|macbook/.test(q)) return 'laptops'
  if (/monitor|display/.test(q)) return 'monitors'
  if (/\btv\b|television/.test(q)) return 'tvs'
  if (/skincare|moisturis|serum|sunscreen|spf/.test(q)) return 'skincare'
  if (/makeup|foundation|lipstick|mascara|blush/.test(q)) return 'makeup'
  if (/protein|supplement|creatine|whey|vitamin/.test(q)) return 'supplements'
  if (/smartwatch|fitness.band|oura|garmin|fitbit/.test(q)) return 'fitness_wearables'
  if (/watch|timepiece/.test(q)) return 'watches'
  if (/perfume|fragrance|cologne|eau.de/.test(q)) return 'fragrances'
  if (/boot|shoe|leather.goods|wallet|belt/.test(q)) return 'boots'
  if (/denim|jeans|selvedge/.test(q)) return 'denim'
  if (/whisky|whiskey|rum|bourbon|scotch/.test(q)) return 'spirits'
  if (/knife|edc|everyday.carry|flashlight/.test(q)) return 'edc'
  if (/pan|cookware|cast.iron|wok/.test(q)) return 'kitchen'
  if (/\bbag\b|handbag|purse|tote/.test(q)) return 'handbags'
  if (/shirt|kurta|dress|clothing|fashion/.test(q)) return 'fashion'
  if (/fountain.pen|nib|ink/.test(q)) return 'pens'
  if (/notebook|planner|stationery/.test(q)) return 'stationery'
  if (/keyboard|mechanical|keycap|switch/.test(q)) return 'keyboards'
  if (/coffee|espresso|grinder|aeropress/.test(q)) return 'coffee'
  if (/board.game|tabletop/.test(q)) return 'boardgames'
  return 'general'
}
