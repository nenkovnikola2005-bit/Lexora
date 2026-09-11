import type { Post } from "../models/Post";

export const seedPosts: Post[] = [
  {
    id: "post-01",
    authorId: "lw-01",
    authorName: "Marko Jovanović",
    authorHeadline: "Advokat · Privredno pravo",
    authorInitials: "MJ",
    content:
      "Danas smo uspešno okončali statusnu promenu pripajanja za klijenta iz " +
      "IT sektora. Postupak je trajao tri meseca, ali je vredelo — kompanija " +
      "sada posluje kao jedinstven pravni subjekt na tri tržišta.",
    createdAt: "2026-09-08T09:15:00.000Z",
    likedBy: ["lw-04", "lw-09", "lw-06"],
    savedBy: ["lw-09"],
    commentsCount: 4,
  },
  {
    id: "post-02",
    authorId: "lw-08",
    authorName: "Tijana Nikolić",
    authorHeadline: "Advokatica · Porodično i nasledno pravo",
    authorInitials: "TN",
    content:
      "Podsetnik kolegama: od nove izmene Porodičnog zakona, rokovi za " +
      "podnošenje predloga za izdržavanje su skraćeni. Pisala sam kratak " +
      "vodič — javite se ako vam zatreba za klijente.",
    createdAt: "2026-09-07T14:40:00.000Z",
    likedBy: ["lw-02", "lw-12"],
    savedBy: ["lw-02", "lw-04"],
    commentsCount: 7,
  },
  {
    id: "post-03",
    authorId: "lw-06",
    authorName: "Ana Ristić",
    authorHeadline: "Advokatica · Intelektualna svojina",
    authorInitials: "AR",
    content:
      "Radionica o zaštiti žigova za startape — 24. septembar u Beogradu. " +
      "Otvoreno je još nekoliko mesta, pošaljite mi poruku ako ste " +
      "zainteresovani za učešće.",
    createdAt: "2026-09-06T11:05:00.000Z",
    likedBy: ["lw-01"],
    savedBy: [],
    commentsCount: 2,
  },
  {
    id: "post-04",
    authorId: "lw-09",
    authorName: "Vladimir Kostić",
    authorHeadline: "Advokat · Privredno pravo",
    authorInitials: "VK",
    content:
      "Zanimljiva analiza: broj M&A transakcija u regionu porastao je za " +
      "18% u prvoj polovini godine. Najviše interesovanja i dalje dolazi iz " +
      "IT i energetskog sektora.",
    createdAt: "2026-09-05T08:30:00.000Z",
    likedBy: ["lw-01", "lw-04", "lw-11", "lw-05"],
    savedBy: ["lw-01"],
    commentsCount: 5,
  },
  {
    id: "post-05",
    authorId: "lw-03",
    authorName: "Nikola Stanković",
    authorHeadline: "Advokat · Krivično pravo",
    authorInitials: "NS",
    content:
      "Učestvovao sam kao panelista na skupu o digitalnim dokazima u " +
      "krivičnom postupku. Sve je izraženija potreba za jasnijim pravilima " +
      "o veštačenju elektronskih uređaja.",
    createdAt: "2026-09-04T16:20:00.000Z",
    likedBy: ["lw-10"],
    savedBy: [],
    commentsCount: 1,
  },
  {
    id: "post-06",
    authorId: "lw-04",
    authorName: "Milica Đorđević",
    authorHeadline: "Advokatica · Nekretnine",
    authorInitials: "MĐ",
    content:
      "Tri stvari koje uvek proveravam pre kupoprodaje nepokretnosti: " +
      "teret u katastru, urednost prethodnih vlasničkih listova i saglasnost " +
      "svih suvlasnika. Mala provera, veliko izbegavanje problema.",
    createdAt: "2026-09-02T10:00:00.000Z",
    likedBy: ["lw-01", "lw-11"],
    savedBy: ["lw-11"],
    commentsCount: 3,
  },
];
