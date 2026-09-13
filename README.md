# Lexora

Lexora je profesionalna mreža za pravnike — projekat iz predmeta veb
programiranje. Aplikacija omogućava advokatima i klijentima da naprave
profil, prate feed sa objavama kolega, izgrade profesionalnu mrežu,
razmenjuju poruke i podese privatnost i obaveštenja naloga.

Dizajn (Figma): [Lexora — Profesionalna mreža za pravnike](https://www.figma.com/design/ndwVnm6klIh1ZNtAZi69JT/Lexora-—-Profesionalna-mreža-za-pravnike?node-id=0-1)

Nema pravog backend-a ni baze podataka — svi podaci (nalozi, objave,
razgovori, podešavanja) čuvaju se isključivo u `localStorage` browsera.

## Tehnologije

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [react-router-dom v7](https://reactrouter.com/) za rutiranje
- SCSS za stilizovanje (CSS custom properties kao dizajn tokeni)

## Pokretanje projekta

```bash
npm install
npm run dev
```

Aplikacija se pokreće na `http://localhost:5173` (ili prvom slobodnom
portu koji Vite ponudi).

Ostale komande:

```bash
npm run build     # tsc -b && vite build — produkciona verzija u dist/
npm run preview   # lokalni pregled produkcionog build-a
npm run lint      # oxlint
```

## Demo nalog

Nalog se automatski kreira pri prvom pokretanju (`AuthService.seedDemoAccount`,
`src/services/AuthService.ts`):

```
Email:   ana.kovacevic@advokat.rs
Lozinka: lexora123
```

Registracija novog naloga je takođe moguća na `/register`.

---

## Mapiranje zahteva iz rubrike

Kratak vodič za ocenjivača — gde se šta nalazi u kodu.

### Stranice (≥5, svaka sa drugačijim sadržajem)

| Ruta | Fajl | Sadržaj |
|---|---|---|
| `/login` | `src/pages/LoginPage.tsx` | Prijava |
| `/register` | `src/pages/RegisterPage.tsx` | Registracija (uloga, merač jačine lozinke) |
| `/feed` | `src/pages/FeedPage.tsx` | Feed objava (kompozitor, sortiranje, sačuvane objave) |
| `/network` | `src/pages/NetworkPage.tsx` | Mreža (filteri + **paginacija**) |
| `/network/:lawyerId` | `src/pages/LawyerProfilePage.tsx` | Javni profil pravnika |
| `/profile` | `src/pages/ProfilePage.tsx` | Sopstveni profil (uređivanje, snaga profila) |
| `/messages`, `/messages/:conversationId` | `src/pages/MessagesPage.tsx` | Poruke (lista razgovora + nit) |
| `/settings/:section` | `src/pages/SettingsPage.tsx` | Podešavanja (4 panela) |
| `*` | `src/pages/NotFoundPage.tsx` | 404 |

Ukupno 9 stranica sa jasno različitim sadržajem (rubrika traži ≥5).

### Reused komponente (≥3, korišćene na 2+ stranica)

| Komponenta | Fajl | Korišćena na |
|---|---|---|
| `Button` | `src/components/ui/Button.tsx` | Svuda — Login, Register, Feed, Network, profili, Messages, Settings |
| `Avatar` | `src/components/ui/Avatar.tsx` | Navbar, Feed (objave i kompozitor), Network, profili, Messages |
| `FormField` | `src/components/ui/FormField.tsx` | Login, Register, `FilterPanel` (Network), Settings |
| `ProfileHeader` | `src/components/profile/ProfileHeader.tsx` | `ProfilePage` i `LawyerProfilePage` |
| `PostCard` | `src/components/feed/PostCard.tsx` | `FeedPage` i `ProfilePage` (sekcija „Aktivnost") |
| `Pagination` | `src/components/ui/Pagination.tsx` | `NetworkPage` |

### TypeScript klase (≥2, sa metodama, aktivno korišćene)

Sve implementiraju `IStorageService`/`IAuthService` iz `src/models/interfaces.ts`
i instanciraju se preko `useMemo` u stranicama koje ih koriste.

- `StorageService<T>` — `src/services/StorageService.ts` (`get`/`set`/`remove`, generički localStorage wrapper)
- `AuthService` — `src/services/AuthService.ts` (`register`, `login`, `logout`, `updateUser`, `changePassword`, `seedDemoAccount`)
- `NetworkService` — `src/services/NetworkService.ts`
- `PostService` — `src/services/PostService.ts`
- `MessageService` — `src/services/MessageService.ts`

### TypeScript interfejsi sa metodama (≥2, aktivno korišćeni)

- `IStorageService<T>` — `src/models/interfaces.ts` — implementira `StorageService`
- `IAuthService` — `src/models/interfaces.ts` — implementira `AuthService`

(Pored ovih, `src/models/*.ts` sadrži i interfejse za oblike podataka —
`User`, `Post`, `Message`, `Conversation`, `LawyerProfile`, `AccountSettings` itd.)

### Paginacija

`NetworkPage` (`src/pages/NetworkPage.tsx`) — rezultati mreže se dele na
stranice po 6 preko custom hook-a `usePagination` (`src/hooks/usePagination.ts`)
i prikazuju preko `Pagination` komponente.

### Filteri

`NetworkPage` + `FilterPanel` (`src/components/network/FilterPanel.tsx`) —
filtriranje po nivou povezanosti, oblasti prava, gradu i zajedničkim vezama,
primenjeno preko `matchesFilters` (`src/models/Lawyer.ts`). Filtriranje
resetuje paginaciju na prvu stranicu.

### React hook-ovi

| Hook | Gde (primeri) |
|---|---|
| `useState` | svuda — forme, filteri, sortiranje, uređivanje |
| `useEffect` | `AuthContext`, `ThemeContext`, `FeedPage`, `NetworkPage`, `MessagesPage` (auto-scroll), `Navbar` |
| `useLocation` | `ProtectedRoute`, `Navbar` |
| `useNavigate` | `LoginPage`, `RegisterPage`, `LawyerProfilePage`, `SettingsPage`, `Navbar` |
| `useContext` | preko `useAuth`/`useTheme` (`AuthContext.tsx`, `ThemeContext.tsx`) |
| `useMemo` | instanciranje servisa (`new AuthService()` i sl.) u većini stranica |
| `useParams` | `LawyerProfilePage`, `MessagesPage`, `SettingsPage`, `SettingsMenu` |
| `useRef` | `MessagesPage` (auto-scroll na poslednju poruku) |
| **Custom:** `useLocalStorage` | `src/hooks/useLocalStorage.ts` — perzistencija podešavanja |
| **Custom:** `usePagination` | `src/hooks/usePagination.ts` |

### Rutiranje (react-router-dom)

`src/App.tsx` koristi `<Routes>`, `<Route>`, `<Navigate>` (redirekcija sa `/`
na `/feed`, sa `/settings` na `/settings/profil`, i sa zaštićenih ruta na
`/login`); `<Outlet>` u `src/components/layout/AppLayout.tsx`; `<Link>`/`<NavLink>`
u `Navbar`, `SettingsMenu`, `LawyerCard`, `ConversationListItem`; `useParams`
kao gore. Zaštita ruta: `src/components/layout/ProtectedRoute.tsx`.

### Modeli i komponente (odvojeni folderi)

`src/models/` (tipovi i domenska logika: `User`, `Post`, `Lawyer`, `Message`,
`Settings`, `interfaces`) odvojeno od `src/components/` (UI, grupisano po
domenu: `ui/`, `layout/`, `feed/`, `network/`, `profile/`, `messages/`,
`settings/`) i `src/pages/` (ruta-nivo kompozicija).

### Nekoliko TypeScript/TSX funkcionalnosti (≥7)

1. Merač jačine lozinke — `calculatePasswordStrength` u `RegisterPage.tsx`
2. Merač „snage profila" — `calculateProfileStrength` u `ProfilePage.tsx`
3. Relativno vreme („pre 3 sata") — `src/utils/formatRelativeTime.ts`
4. Srpska pravila množine — `src/utils/pluralizeSr.ts`
5. Izvoz podataka u JSON (Blob + privremeni `<a>` klik) — `handleExportData` u `SettingsPage.tsx`
6. Heširanje lozinke (Web Crypto SHA-256) — `AuthService.ts`
7. Sortiranje objava (najnovije/najpopularnije) — `sortPosts` u `src/models/Post.ts`
8. Filtriranje pravnika — `matchesFilters` u `src/models/Lawyer.ts`
9. Paginacija — `usePagination` hook
10. Auto-scroll na poslednju poruku — `MessagesPage.tsx`

## Pristupačnost i responsivnost

- Fokus je uvek vidljiv pri navigaciji tastaturom (`:focus-visible` u `src/index.scss`).
- Forme koriste `<label htmlFor>` povezan sa poljima, `aria-invalid`/`aria-describedby`
  za greške (`FormField.tsx`), i `role="alert"` na porukama o grešci.
- Prilagođeni prekidači (uloga, sortiranje) koriste ispravnu ARIA semantiku
  (`role="radio"`/`aria-checked`), a dugmad za lajk/čuvanje koriste `aria-pressed`.
- Sve trokolonske/dvopanelne stranice (Feed, Network, Profile, Messages,
  Settings) sklapaju se u jednu kolonu na uskim ekranima preko `respond()`
  mixin-a (`src/styles/_mixins.scss`, prelomne tačke ~640px i ~1024px).
