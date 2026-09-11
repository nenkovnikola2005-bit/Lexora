import type { LawyerProfile } from "../models/Lawyer";

export const seedLawyers: LawyerProfile[] = [
  {
    id: "lw-01",
    firstName: "Marko",
    lastName: "Jovanović",
    headline: "Advokat · Privredno pravo",
    practiceArea: "Privredno pravo",
    city: "Beograd",
    connectionLevel: 1,
    mutualConnections: 12,
    avatarInitials: "MJ",
    about:
      "Bavim se privrednim sporovima, statusnim promenama privrednih društava i " +
      "ugovornim pravom već preko dvanaest godina. Zastupam domaće i strane klijente.",
    experience: [
      { role: "Advokat, osnivač", organization: "Advokatska kancelarija Jovanović", period: "2016–danas" },
      { role: "Advokatski pripravnik", organization: "AK Nikolić i partneri", period: "2012–2016" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Beogradu", degree: "Diplomirani pravnik", period: "2007–2011" },
    ],
    skills: ["Privredno pravo", "Statusne promene", "Ugovori", "Arbitraža"],
  },
  {
    id: "lw-02",
    firstName: "Jelena",
    lastName: "Petrović",
    headline: "Advokatica · Radno pravo",
    practiceArea: "Radno pravo",
    city: "Novi Sad",
    connectionLevel: 2,
    mutualConnections: 5,
    avatarInitials: "JP",
    about:
      "Specijalizovana za radne sporove, kolektivne ugovore i zaštitu zaposlenih. " +
      "Redovno sarađujem sa sindikatima i HR sektorima kompanija.",
    experience: [
      { role: "Advokatica", organization: "Advokatska kancelarija Petrović", period: "2018–danas" },
      { role: "Pravni savetnik", organization: "Sindikat radnika Vojvodine", period: "2014–2018" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Novom Sadu", degree: "Diplomirani pravnik", period: "2009–2013" },
    ],
    skills: ["Radno pravo", "Kolektivni ugovori", "Mobing", "Medijacija"],
  },
  {
    id: "lw-03",
    firstName: "Nikola",
    lastName: "Stanković",
    headline: "Advokat · Krivično pravo",
    practiceArea: "Krivično pravo",
    city: "Niš",
    connectionLevel: 2,
    mutualConnections: 3,
    avatarInitials: "NS",
    about:
      "Odbrana u krivičnim postupcima, sa fokusom na privredni kriminal i " +
      "krivična dela protiv imovine. Predajem i na seminarima krivične odbrane.",
    experience: [
      { role: "Advokat", organization: "Advokatska kancelarija Stanković", period: "2015–danas" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Nišu", degree: "Diplomirani pravnik", period: "2008–2012" },
      { school: "Pravni fakultet Univerziteta u Beogradu", degree: "Master krivičnopravne nauke", period: "2012–2013" },
    ],
    skills: ["Krivično pravo", "Odbrana", "Privredni kriminal"],
  },
  {
    id: "lw-04",
    firstName: "Milica",
    lastName: "Đorđević",
    headline: "Advokatica · Nekretnine",
    practiceArea: "Nekretnine",
    city: "Beograd",
    connectionLevel: 1,
    mutualConnections: 9,
    avatarInitials: "MĐ",
    about:
      "Promet nepokretnosti, ugovori o kupoprodaji, hipoteke i due diligence " +
      "za investitore u stambenim i komercijalnim projektima.",
    experience: [
      { role: "Advokatica, ortak", organization: "Đorđević & Simić Advokati", period: "2019–danas" },
      { role: "Advokat saradnik", organization: "AK Radovanović", period: "2013–2019" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Beogradu", degree: "Diplomirani pravnik", period: "2006–2010" },
    ],
    skills: ["Nekretnine", "Due diligence", "Hipoteke", "Katastar"],
  },
  {
    id: "lw-05",
    firstName: "Stefan",
    lastName: "Ilić",
    headline: "Advokat · Poresko pravo",
    practiceArea: "Poresko pravo",
    city: "Kragujevac",
    connectionLevel: 3,
    mutualConnections: 1,
    avatarInitials: "SI",
    about:
      "Poresko planiranje, poreski sporovi i zastupanje pred poreskom upravom. " +
      "Ranije radio u poreskom odeljenju velike revizorske kuće.",
    experience: [
      { role: "Advokat", organization: "Ilić Tax & Law", period: "2017–danas" },
      { role: "Poreski konsultant", organization: "Revizija Plus d.o.o.", period: "2011–2017" },
    ],
    education: [
      { school: "Ekonomski fakultet Univerziteta u Kragujevcu", degree: "Master poreskog prava", period: "2010–2011" },
      { school: "Pravni fakultet Univerziteta u Kragujevcu", degree: "Diplomirani pravnik", period: "2005–2009" },
    ],
    skills: ["Poresko pravo", "Poreski sporovi", "Transferne cene"],
  },
  {
    id: "lw-06",
    firstName: "Ana",
    lastName: "Ristić",
    headline: "Advokatica · Intelektualna svojina",
    practiceArea: "Intelektualna svojina",
    city: "Beograd",
    connectionLevel: 2,
    mutualConnections: 7,
    avatarInitials: "AR",
    about:
      "Zaštita žigova, patenata i autorskih prava, sa posebnim fokusom na " +
      "tehnološke startape i medijsku industriju.",
    experience: [
      { role: "Advokatica", organization: "IP Legal Ristić", period: "2020–danas" },
      { role: "Advokat saradnik", organization: "AK Milošević i partneri", period: "2015–2020" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Beogradu", degree: "Diplomirani pravnik", period: "2010–2014" },
    ],
    skills: ["Žigovi", "Autorsko pravo", "Patenti", "IT ugovori"],
  },
  {
    id: "lw-07",
    firstName: "Miloš",
    lastName: "Pavlović",
    headline: "Advokat · Migraciono pravo",
    practiceArea: "Migraciono pravo",
    city: "Subotica",
    connectionLevel: 3,
    mutualConnections: 0,
    avatarInitials: "MP",
    about:
      "Zastupanje u postupcima azila, dozvola boravka i naturalizacije. " +
      "Sarađujem sa nevladinim organizacijama na zaštiti prava migranata.",
    experience: [
      { role: "Advokat", organization: "Advokatska kancelarija Pavlović", period: "2016–danas" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Novom Sadu", degree: "Diplomirani pravnik", period: "2009–2013" },
    ],
    skills: ["Migraciono pravo", "Azil", "Dozvole boravka"],
  },
  {
    id: "lw-08",
    firstName: "Tijana",
    lastName: "Nikolić",
    headline: "Advokatica · Porodično i nasledno pravo",
    practiceArea: "Porodično i nasledno pravo",
    city: "Novi Sad",
    connectionLevel: 1,
    mutualConnections: 14,
    avatarInitials: "TN",
    about:
      "Razvodi, starateljstvo, podela imovine i ostavinski postupci. " +
      "Zastupam klijente uz naglasak na mirno rešavanje porodičnih sporova.",
    experience: [
      { role: "Advokatica", organization: "Advokatska kancelarija Nikolić", period: "2014–danas" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Novom Sadu", degree: "Diplomirani pravnik", period: "2007–2011" },
    ],
    skills: ["Porodično pravo", "Nasledno pravo", "Medijacija"],
  },
  {
    id: "lw-09",
    firstName: "Vladimir",
    lastName: "Kostić",
    headline: "Advokat · Privredno pravo",
    practiceArea: "Privredno pravo",
    city: "Beograd",
    connectionLevel: 2,
    mutualConnections: 6,
    avatarInitials: "VK",
    about:
      "M&A transakcije, korporativno upravljanje i savetovanje stranih investitora " +
      "prilikom ulaska na srpsko tržište.",
    experience: [
      { role: "Senior advokat", organization: "Kostić Corporate Law", period: "2017–danas" },
      { role: "Advokat saradnik", organization: "Međunarodna advokatska kancelarija", period: "2011–2017" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Beogradu", degree: "Diplomirani pravnik", period: "2005–2009" },
      { school: "Pravni fakultet, Nemačka", degree: "LL.M. privredno pravo", period: "2009–2010" },
    ],
    skills: ["M&A", "Korporativno pravo", "Strane investicije"],
  },
  {
    id: "lw-10",
    firstName: "Sara",
    lastName: "Mitrović",
    headline: "Advokatica · Krivično pravo",
    practiceArea: "Krivično pravo",
    city: "Beograd",
    connectionLevel: 3,
    mutualConnections: 2,
    avatarInitials: "SM",
    about:
      "Odbrana maloletnika i zastupanje oštećenih u krivičnom postupku. " +
      "Angažovana i kao branilac po službenoj dužnosti.",
    experience: [
      { role: "Advokatica", organization: "Advokatska kancelarija Mitrović", period: "2019–danas" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Beogradu", degree: "Diplomirani pravnik", period: "2012–2016" },
    ],
    skills: ["Krivično pravo", "Maloletnička delikvencija"],
  },
  {
    id: "lw-11",
    firstName: "Filip",
    lastName: "Radovanović",
    headline: "Advokat · Nekretnine",
    practiceArea: "Nekretnine",
    city: "Niš",
    connectionLevel: 2,
    mutualConnections: 4,
    avatarInitials: "FR",
    about:
      "Pravno savetovanje u izgradnji i prometu nepokretnosti, legalizacija " +
      "objekata i zastupanje investitora pred lokalnim samoupravama.",
    experience: [
      { role: "Advokat", organization: "Radovanović Nekretnine Legal", period: "2015–danas" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta u Nišu", degree: "Diplomirani pravnik", period: "2008–2012" },
    ],
    skills: ["Nekretnine", "Legalizacija", "Urbanizam"],
  },
  {
    id: "lw-12",
    firstName: "Ivana",
    lastName: "Simić",
    headline: "Advokatica · Radno pravo",
    practiceArea: "Radno pravo",
    city: "Podgorica",
    connectionLevel: 1,
    mutualConnections: 8,
    avatarInitials: "IS",
    about:
      "Savetovanje poslodavaca pri usklađivanju internih akata sa zakonom o radu, " +
      "kao i zastupanje zaposlenih u sporovima zbog nezakonitog otkaza.",
    experience: [
      { role: "Advokatica, ortak", organization: "Simić & Vuković Advokati", period: "2018–danas" },
    ],
    education: [
      { school: "Pravni fakultet Univerziteta Crne Gore", degree: "Diplomirani pravnik", period: "2010–2014" },
    ],
    skills: ["Radno pravo", "Interni akti", "Otkaz ugovora o radu"],
  },
];
