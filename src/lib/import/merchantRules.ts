import type { Category } from "@/types";

export interface MerchantRule {
  category: string; // must match an existing categories.name
  keywords: string[]; // matched case-insensitively as substrings of the description
}

/** Common Singapore merchants/companies, grouped by the default expense category they belong to. */
export const MERCHANT_RULES: MerchantRule[] = [
  {
    category: "Food",
    keywords: [
      "NTUC", "FAIRPRICE", "SHENG SIONG", "COLD STORAGE", "GIANT", "PRIME SUPERMARKET",
      "MUSTAFA", "DON DON DONKI", "DONKI", "REDMART", "FOODPANDA", "GRABFOOD",
      "DELIVEROO", "MCDONALD", "KFC", "BURGER KING", "SUBWAY", "STARBUCKS", "COFFEE BEAN",
      "TOAST BOX", "YA KUN", "DIN TAI FUNG", "KOI", "LIHO", "MR COCONUT", "BREADTALK",
      "FOOD COURT", "KOPITIAM", "OLD CHANG KEE", "SUSHI", "PIZZA", "JOLLIBEAN",
    ],
  },
  {
    category: "Transport",
    keywords: [
      "GRAB", "GOJEK", "COMFORTDELGRO", "CDG ZIG", "SMRT", "SBS TRANSIT", "EZ-LINK",
      "EZLINK", "TRANSITLINK", "SIMPLYGO", "SMART TAXI", "CITYCAB", "PREMIER TAXI",
      "SHELL", "ESSO", "CALTEX", "SPC ", "SPC-", "ERP", "LTA ", "ONEMOTORING",
      "BUS/MRT",
    ],
  },
  {
    category: "Subscriptions",
    keywords: [
      "NETFLIX", "SPOTIFY", "DISNEY", "HBO GO", "YOUTUBE PREMIUM", "APPLE.COM/BILL",
      "APPLE MUSIC", "ICLOUD", "GOOGLE ONE", "GOOGLE PLAY", "AMAZON PRIME", "VIU",
      "MEWATCH", "STARHUB TV", "MICROSOFT 365", "OFFICE 365", "ADOBE", "GYMPASS",
      "CLASSPASS", "FITBLOC",
    ],
  },
  {
    category: "Utilities",
    keywords: [
      "SP GROUP", "SP SERVICES", "SP DIGITAL", "SINGTEL", "STARHUB", "M1 LIMITED",
      "M1 POSTPAID", "CITY GAS", "CITYGAS", "PUB SINGAPORE", "MYREPUBLIC", "CIRCLES.LIFE",
      "GIGA", "TPG TELECOM", "SIMBA", "AXS SERVICE",
    ],
  },
];

const FALLBACK_CATEGORY_NAME = "Etc";

export function categorizeDescription(
  description: string,
  categories: Category[]
): { categoryId: number; categoryName: string } {
  const normalized = description.toUpperCase();
  const fallback = categories.find((c) => c.name === FALLBACK_CATEGORY_NAME);

  for (const rule of MERCHANT_RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      const match = categories.find((c) => c.name === rule.category);
      if (match) return { categoryId: match.id, categoryName: match.name };
      break; // rule's target category doesn't exist in this DB anymore; fall through to Etc
    }
  }

  if (fallback) return { categoryId: fallback.id, categoryName: fallback.name };

  // "Etc" is normally seeded by schema.sql; if it's missing (deleted manually), fall back to
  // whatever category exists so import can still proceed instead of throwing mid-parse.
  const first = categories[0];
  if (!first) throw new Error("No categories exist to assign imported transactions to.");
  return { categoryId: first.id, categoryName: first.name };
}
