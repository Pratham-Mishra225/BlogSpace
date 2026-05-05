
# BlogSpace — Full Build + Enhancements

Production-grade minimalist blogging platform on TanStack Start (Next.js isn't supported here; same architecture, routes live in `src/routes/`). Builds the original spec **plus** the enhancements below in a single pass.

## Stack & conventions

- TanStack Start + TypeScript strict, Tailwind v4, shadcn/ui, Framer Motion
- Zustand (persisted to localStorage) for auth, theme, feed toggle, search query
- All data flows through `src/services/api.ts` — no fetching in components
- Mock API: 700ms delay, simulated loading + error states

## Design system

- **Type**: Playfair Display (headings) + Inter (body), loaded in `__root.tsx`
- **Reading width**: 720px max, line-height 1.75–1.9
- **Spacing scale**: 4 / 8 / 16 / 24 / 32 / 48
- **Color**: semantic tokens (`background`, `foreground`, `primary`, `muted`, `accent`, `border`) tuned for WCAG-AA in both modes; dark mode via `.dark` class on `<html>`
- Glassmorphism navbar (`backdrop-blur` + translucent border)

## Folder structure

```text
src/
  routes/
    __root.tsx          # html shell, fonts, providers, navbar, page transitions
    index.tsx           # / Home feed (Explore / Following + search results)
    post.$id.tsx        # /post/:id reading view
    editor.tsx          # /editor zen editor (auth-guarded)
    profile.$id.tsx     # /profile/:id
  components/
    ui/                 # existing shadcn primitives
    Navbar.tsx          # logo, debounced search, theme switch, auth/profile
    PostCard.tsx
    FeedToggle.tsx
    FollowButton.tsx
    ThemeSwitcher.tsx
    EditorForm.tsx
    AuthDialog.tsx
    PostSkeleton.tsx
    PageTransition.tsx
    AuthorBio.tsx
    EmptyState.tsx      # reusable empty-state (icon + message + optional CTA)
  features/
    posts/PostList.tsx
    auth/AuthProvider.tsx
    profile/ProfileHeader.tsx
  services/
    api.ts              # in-memory DB + all API functions
  types/
    index.ts            # User, Post, Profile, CreatePostDTO, AuthDTO
  lib/
    markdown.tsx        # MarkdownRenderer component (react-markdown)
    format.ts           # date / reading-time helpers
  hooks/
    usePosts.ts
    useProfile.ts
    useAuth.ts
    useDebounce.ts
  store/
    useAuthStore.ts
    useThemeStore.ts
    useFeedStore.ts
    useSearchStore.ts
```

## Types (`src/types/index.ts`)

- `User` — id, name, avatar, bio
- `Post` — id, title, content, coverImage, author (User), tags, createdAt, readingTime
- `Profile` — user, followersCount, followingCount, posts[]
- `CreatePostDTO` — title, content, coverImage?, tags[]
- `AuthDTO` — email, password

All API signatures use these DTOs.

## API layer & persistent mock DB (`src/services/api.ts`)

Module-scoped in-memory arrays seeded once on import:

```ts
const posts: Post[] = [/* ~8 seeded */]
const users: User[] = [/* ~4 seeded */]
const follows: { followerId: string; followingId: string }[] = []
```

Functions (all `Promise<T>`, 700ms delay, ~5% simulated error):

- `getPosts(): Promise<Post[]>`
- `getFollowingPosts(): Promise<Post[]>` — filters `posts` by `follows`
- `getPostById(id): Promise<Post>`
- `createPost(data: CreatePostDTO): Promise<Post>` — generates id, computes readingTime, attaches current user as author, **pushes into `posts[]`** so new posts appear immediately in the feed and persist for the session
- `toggleFollow(userId): Promise<void>` — mutates `follows[]`
- `getProfile(id): Promise<Profile>`
- `login(data: AuthDTO): Promise<User>` / `signup(data: AuthDTO): Promise<User>` — mock; resolves to a seeded user

Hooks (`usePosts`, `useProfile`, `useAuth`) wrap API and return `{ data, loading, error, refetch }`.

## Routes

1. **`/` Home Feed** — Hero strip, `FeedToggle` (Explore / Following), responsive `PostCard` grid. When the navbar search query is non-empty, swaps grid for client-side filtered results (see Search).
2. **`/post/:id`** — Centered ≤720px column. Cover, serif H1, meta line, **`MarkdownRenderer`** body, `AuthorBio` + `FollowButton` footer.
3. **`/editor`** — Zen editor (title, cover URL, tags CSV, markdown body), sticky Save Draft / Publish bar. Auth-guarded (see below). Calls `createPost(dto)` then redirects to the new post.
4. **`/profile/:id`** — Header (avatar, name, bio, follow stats, FollowButton) + grid of that user's posts.

## Auth guard for `/editor`

Implemented in the route component (mock auth, no redirect needed):

- Read `user` from `useAuthStore`
- If absent: render an empty editor shell + immediately open `AuthDialog`; submit/draft buttons disabled
- On successful login the dialog closes and the editor becomes interactive
- AuthDialog also opens from Navbar's "Sign in" button

## Client-side search

- Navbar `<input>` writes to `useSearchStore` with **300ms debounce** (`useDebounce` hook)
- Active **only on `/`** — Home reads the query and filters the loaded `posts` by `title`, any `tags[]` match, or `author.name` (case-insensitive)
- No API call; pure client filter
- Empty result → `EmptyState` ("No results for '<query>'")
- Search input hidden / no-op on other routes

## Markdown rendering

- Add `react-markdown` (+ `remark-gfm` for tables/strikethrough)
- `src/lib/markdown.tsx` exports `<MarkdownRenderer source={string} />`
  - Wraps content in a typography container (custom `prose`-style classes matching the design system: serif h1–h3, Inter body, 1.85 line-height, code blocks with muted background, styled links, lists)
  - Safe by default — no `rehype-raw`, raw HTML is stripped
  - Components map: headings, lists, links (`target="_blank" rel="noreferrer"`), inline + block code, blockquote
- Used on `/post/:id`. Editor stays write-only (preview happens on the post page).

## Empty states (`EmptyState.tsx`)

Reusable: `{ icon, title, description, action? }`. Specific instances:

- Explore empty → "No stories yet" + "Write the first one" CTA → `/editor`
- Following empty → "Your feed is quiet" + "Discover writers" CTA → switches toggle to Explore
- Profile empty → "<Name> hasn't published yet"
- Search empty → "No results for '<query>'" + "Clear search" CTA

Each uses a minimal Lucide icon, centered, generous whitespace.

## Animations

- Page transition wrapper: fade + 8px upward translate
- `PostCard` hover: `scale: 1.02` + soft shadow
- Buttons: `whileTap={{ scale: 0.97 }}`

## Loading & error UX

- `PostSkeleton` grid on feed, skeleton blocks on reading view & profile
- Inline error card with Retry button — never a blank screen

## Constraints honored

- No folder restructuring beyond adding files listed above
- API abstraction preserved — components only call hooks
- TypeScript strict, no `any`
- Design system unchanged

## Out of scope

Real backend, real auth, image uploads, comments. Swap `src/services/api.ts` to ship to production data.
