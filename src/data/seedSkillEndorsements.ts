// Ključ je oblika "<id pravnika>::<veština>", vrednost je lista id-jeva kolega koji su je potvrdili.
export const seedSkillEndorsements: Record<string, string[]> = {
  "lw-01::Privredno pravo": ["lw-04", "lw-06", "lw-09", "lw-02", "lw-11"],
  "lw-01::Ugovori": ["lw-04", "lw-09"],
  "lw-01::Statusne promene": ["lw-09"],
  "lw-04::Nekretnine": ["lw-01", "lw-11", "lw-06"],
  "lw-04::Due diligence": ["lw-01", "lw-09"],
  "lw-06::Žigovi": ["lw-01", "lw-12"],
  "lw-08::Porodično pravo": ["lw-02", "lw-12", "lw-04"],
  "lw-08::Medijacija": ["lw-02"],
  "lw-09::M&A": ["lw-01", "lw-04", "lw-06"],
  "lw-09::Korporativno pravo": ["lw-01"],
};
