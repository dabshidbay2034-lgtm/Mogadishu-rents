// Mogadishu districts (degmooyinka Muqdisho)
export const MOGADISHU_DISTRICTS = [
  "Abdiaziz",
  "Bondhere",
  "Daynile",
  "Dharkenley",
  "Hamar Jajab",
  "Hamar Weyne",
  "Heliwa",
  "Hodan",
  "Howl Wadaag",
  "Huriwa",
  "Kahda",
  "Karaan",
  "Shangani",
  "Shibis",
  "Waberi",
  "Wadajir",
  "Wardhigley",
  "Yaqshid",
] as const;

export type MogadishuDistrict = (typeof MOGADISHU_DISTRICTS)[number];
