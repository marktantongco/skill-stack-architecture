---
name: vercel-react-best-practices
description: Production-grade React architecture, hooks patterns, performance optimization, SSR/SSG strategies, and state management best practices. Use when building Next.js or React applications to ensure optimal component structure, rendering patterns, and performance.
---

# Vercel React Best Practices Skill

**Version:** 1.1  
**Scope:** Production-grade React architecture, hooks patterns, performance optimization, SSR/SSG strategies, and state management.  
**Works with:** Next.js, React 18+, TypeScript, Tailwind CSS  
**Word Count:** ~10,000 | **Embedded Data:** 28 hook patterns, 16 performance rules, 12 component architectures, 8 state strategies, 6 testing patterns

---

## MODULE 0: Architecture Principles

### 0.1 The Component Decision Tree

**Before creating any component, answer:**

1. Is it shared across pages? → `components/ui/`
2. Is it page-specific? → `app/page/components/`
3. Does it manage state? → Consider if state belongs here or higher
4. Does it fetch data? → Use Server Component by default
5. Does it need client interactivity? → Mark `'use client'`
6. Is it a layout concern? → `app/layout.tsx`

### 0.2 Server vs Client Components

```tsx
// SERVER COMPONENT (default — no directive)
// Can: fetch data, access backend, keep bundle small
// Cannot: use hooks, browser APIs, event handlers

async function ProductList() {
  const products = await db.products.findMany();
  return (
    <ul>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}

// CLIENT COMPONENT
// Can: use hooks, browser APIs, event handlers
// Cannot: be async, access backend directly

'use client';

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <li 
      onMouseEnter={() => setIsHovered(true)}
      className={isHovered ? 'elevated' : ''}
    >
      {product.name}
    </li>
  );
}
```

**The 80/20 Rule:** 80% of your components should be Server Components. Only use Client Components for interactivity.

### 0.3 File Structure

```
app/
├── (marketing)/           # Route group
│   ├── page.tsx
│   ├── layout.tsx
│   └── about/
│       └── page.tsx
├── (dashboard)/           # Route group
│   ├── layout.tsx         # Dashboard shell
│   └── projects/
│       ├── page.tsx       # Server Component
│       └── [id]/
│           ├── page.tsx
│           └── edit/
│               └── page.tsx
├── api/                   # API routes
├── layout.tsx             # Root layout
├── error.tsx              # Error boundary
├── loading.tsx            # Loading UI
├── not-found.tsx          # 404 page
├── globals.css
└── providers.tsx          # Client providers

components/
├── ui/                    # Reusable UI (shadcn/ui style)
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── forms/                 # Form-specific
├── layouts/               # Layout components
└── providers/             # Context providers

lib/
├── utils.ts               # cn(), helpers
├── db.ts                  # Database client
├── auth.ts                # Auth helpers
└── api.ts                 # API client

hooks/
├── use-media-query.ts
├── use-local-storage.ts
└── use-debounce.ts

types/
├── index.ts
└── api.ts
```

### 0.4 Skill Selector — Decision Tree

**Route users to the right skill based on project type:**

```
START: What are you building?
│
├─ AI Chat Interface → Anthropic Frontend Design (Trust, conversation)
│                      + UI/UX Pro Max v7.1 (Components)
│
├─ Marketing/Landing Page → UI/UX Pro Max v7.1 (Design system)
│                    + GSAP Animations (Motion)
│
├─ Dashboard/SaaS App → THIS SKILL (Primary - Architecture)
│                      + UI/UX Pro Max v7.1 (Components)
│                      + Vercel Web Design Guidelines (Accessibility)
│
├─ Animation-Heavy Site → GSAP Animations (Complex motion)
│                      + THIS SKILL (State management)
│
├─ Accessible Gov/Health → Vercel Web Design Guidelines (WCAG)
│                        + THIS SKILL (Architecture)
│
└─ Full Production App → ALL FIVE SKILLS
```

### 0.5 Version Compatibility

| This Skill | Works With | Not Compatible With |
|------------|------------|------------------|
| v1.1 | Next.js 14+ | Next.js 13 |
| v1.1 | React 18+ | React 17 |
| v1.1 | UI/UX Pro Max v7.1+ | Pre-v7.1 |

### 0.6 Cross-Skill Integration Quick Reference

| You Need | Use This Skill | Then Add |
|---------|----------------|----------|
| Component architecture | vercel-react-best-practices | UI/UX Pro Max |
| State management (Zustand) | vercel-react-best-practices | UI/UX Pro Max |
| Server/Client patterns | vercel-react-best-practices | UI/UX Pro Max |
| Performance optimization | vercel-react-best-practices | UI/UX Pro Max |
| Design tokens | UI/UX Pro Max | This skill |
| WCAG accessibility | Vercel Web Design Guidelines | This skill |

---

## MODULE 1: Hooks Patterns

### 1.1 The Essential Custom Hooks

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// hooks/use-media-query.ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// hooks/use-click-outside.ts
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// hooks/use-previous.ts
export function usePrevious<T>(value: T): T | undefined {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<T>();

  useEffect(() => {
    if (value !== current) {
      setPrevious(current);
      setCurrent(value);
    }
  }, [value, current]);

  return previous;
}

// hooks/use-fetch.ts
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, error, isLoading };
}
```

### 1.2 The Rules of Hooks

**Always:**
1. Call hooks at the top level (not in loops, conditions, or nested functions)
2. Call hooks from React functions (components or custom hooks)
3. Name custom hooks starting with `use`
4. Keep hooks focused (single responsibility)

**Never:**
1. Call hooks conditionally
2. Call hooks in event handlers
3. Call hooks in class components
4. Create hooks that return more than 3 values (use objects instead)

### 1.3 useEffect Mastery

```typescript
// ✅ DO: Single responsibility effects
useEffect(() => {
  // Handle subscription
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);

useEffect(() => {
  // Handle analytics
  analytics.track('page_view', { path });
}, [path]);

// ❌ DON'T: Multiple concerns in one effect
useEffect(() => {
  const subscription = subscribe();
  analytics.track('page_view');
  document.title = title;
  return () => subscription.unsubscribe();
}, []);

// ✅ DO: Proper cleanup patterns
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort();
}, []);

useEffect(() => {
  const handler = () => setScrollY(window.scrollY);
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}, []);

useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);

// ✅ DO: Avoid stale closures with refs
const callbackRef = useRef(callback);
callbackRef.current = callback;

useEffect(() => {
  const id = setInterval(() => callbackRef.current(), 1000);
  return () => clearInterval(id);
}, []);
```

---

## MODULE 2: Performance

### 2.1 Memoization Strategy

```tsx
// ✅ DO: Memoize expensive computations
const sortedProducts = useMemo(() => {
  return [...products].sort((a, b) => b.rating - a.rating);
}, [products]);

// ✅ DO: Memoize callback props to prevent child re-renders
const handleSubmit = useCallback((data: FormData) => {
  mutate(data);
}, [mutate]);

// ✅ DO: Memoize component definitions
const MemoizedChart = memo(ChartComponent, (prev, next) => {
  return prev.data === next.data;
});

// ❌ DON'T: Memoize everything (measure first)
// ❌ DON'T: Memoize primitive values
const count = useMemo(() => items.length, [items]); // Waste

// ❌ DON'T: Create objects in render without memo
// BAD:
<Chart options={{ responsive: true }} /> // New object every render

// GOOD:
const options = useMemo(() => ({ responsive: true }), []);
<Chart options={options} />
```

### 2.2 Virtualization

```tsx
// For lists > 50 items
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ListItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2.3 Code Splitting Patterns

```tsx
// Route-level (automatic in Next.js)
// Component-level
const HeavyEditor = dynamic(() => import('./HeavyEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

// Conditional loading
const Map = dynamic(() => import('./Map'), { ssr: false });

// Library loading
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
});

// Preload on interaction
const preloadModal = () => {
  const ModalComponent = import('./Modal');
};

<button onMouseEnter={preloadModal} onClick={() => setShowModal(true)}>
  Open Modal
</button>
```

### 2.4 State Colocation

```tsx
// ❌ DON'T: Lift state unnecessarily
// App.tsx
const [email, setEmail] = useState(''); // Only used in Footer

// ✅ DO: Keep state close to where it's used
// Footer.tsx
const [email, setEmail] = useState('');

// ✅ DO: Lift state only when shared
// Parent.tsx
const [filters, setFilters] = useState<Filters>({});

// FilterBar.tsx + ProductList.tsx both need filters
```

### 2.5 The React Compiler (Future)

```tsx
// React 19+ with compiler enabled
// Manual memoization becomes unnecessary

// Before (React 18)
const memoizedValue = useMemo(() => compute(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a), [a]);

// After (React 19 + Compiler)
const value = compute(a, b); // Automatically memoized
const callback = () => doSomething(a); // Automatically memoized
```

---

## MODULE 3: State Management

### 3.1 The State Decision Matrix

| State Type | Solution | When |
|-----------|----------|------|
| Local UI | useState | Single component |
| Derived | useMemo | Computed from props/state |
| Shared UI | useContext + useState | 2-3 components, shallow tree |
| Server cache | React Query / SWR | API data |
| Form state | React Hook Form | Any form |
| Global UI | Zustand | 4+ components, deep tree |
| Complex logic | useReducer | Multiple related state updates |

### 3.2 Zustand Pattern

```typescript
// stores/use-user-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  preferences: UserPreferences;
  updatePreference: (key: keyof UserPreferences, value: any) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      preferences: { theme: 'system', notifications: true },
      updatePreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),
    }),
    { name: 'user-storage' }
  )
);

// Usage in component
const user = useUserStore((state) => state.user); // Only re-renders when user changes
const setUser = useUserStore((state) => state.setUser);
```

### 3.3 React Query Pattern

```typescript
// hooks/use-products.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Provider setup
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3.4 useReducer for Complex State

```typescript
interface State {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
}

type Action =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_LOADING'; payload: boolean };

function cartReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

function useCart() {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    isLoading: false,
  });

  return { state, dispatch };
}
```

---

## MODULE 4: Component Patterns

### 4.1 Compound Components

```tsx
// components/select.tsx
import { createContext, useContext, useState } from 'react';

interface SelectContextValue {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelect() {
  const context = useContext(SelectContext);
  if (!context) throw new Error('Select components must be used within <Select>');
  return context;
}

export function Select({ 
  children, 
  value, 
  onChange 
}: { 
  children: React.ReactNode; 
  value: string; 
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onChange, isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  const { setIsOpen } = useSelect();
  return (
    <button onClick={() => setIsOpen(true)} className="w-full text-left">
      {children}
    </button>
  );
}

export function SelectOption({ value, children }: { value: string; children: React.ReactNode }) {
  const { value: selectedValue, onChange, setIsOpen } = useSelect();
  const isSelected = selectedValue === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => { onChange(value); setIsOpen(false); }}
      className={cn('px-3 py-2 cursor-pointer', isSelected && 'bg-blue-100')}
    >
      {children}
    </div>
  );
}

// Usage
<Select value={value} onChange={setValue}>
  <SelectTrigger>Select an option</SelectTrigger>
  <SelectOption value="a">Option A</SelectOption>
  <SelectOption value="b">Option B</SelectOption>
</Select>
```

### 4.2 Render Props Pattern

```tsx
// components/data-fetcher.tsx
interface DataFetcherProps<T> {
  url: string;
  children: (data: { data: T | null; loading: boolean; error: Error | null }) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, isLoading, error } = useQuery({
    queryKey: [url],
    queryFn: () => fetch(url).then(r => r.json()),
  });

  return <>{children({ data, loading: isLoading, error })}</>;
}

// Usage
<DataFetcher url="/api/user">
  {({ data, loading, error }) => {
    if (loading) return <Skeleton />;
    if (error) return <Error message={error.message} />;
    return <UserProfile user={data} />;
  }}
</DataFetcher>
```

### 4.3 Polymorphic Components

```tsx
// components/box.tsx
import { ElementType, ComponentPropsWithoutRef, forwardRef } from 'react';

interface BoxProps<T extends ElementType = 'div'> {
  as?: T;
  children: React.ReactNode;
}

export const Box = forwardRef(function Box<T extends ElementType = 'div'>(
  { as, children, ...props }: BoxProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof BoxProps<T>>,
  ref: React.Ref<ElementType>
) {
  const Component = as || 'div';
  return <Component ref={ref} {...props}>{children}</Component>;
}) as <T extends ElementType = 'div'>(
  props: BoxProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof BoxProps<T>> & { ref?: React.Ref<ElementType> }
) => React.ReactElement;

// Usage
<Box as="section" className="py-8">Content</Box>
<Box as="button" onClick={handleClick}>Click me</Box>
<Box as={Link} href="/about">About</Box>
```

### 4.4 Slot Pattern

```tsx
// components/card.tsx
interface CardProps {
  children: React.ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 border-b">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 border-t bg-gray-50">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

---

## MODULE 5: Forms

### 5.1 React Hook Form + Zod

```tsx
// components/contact-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input
          {...register('name')}
          id="name"
          className="mt-1 block w-full rounded-md border px-3 py-2"
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">Message</label>
        <textarea
          {...register('message')}
          id="message"
          rows={4}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

---

## MODULE 6: Error Handling

### 6.1 Error Boundaries

```tsx
// components/error-boundary.tsx
'use client';

import React, { Component, ErrorInfo } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 rounded-lg bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="mt-2 text-red-600">Please refresh the page or try again later.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in layout
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

### 6.2 API Error Handling

```typescript
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// lib/api-client.ts
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(
      error.message || 'An error occurred',
      response.status,
      error.code || 'UNKNOWN_ERROR'
    );
  }

  return response.json();
}

// Usage with React Query
const { data, error } = useQuery({
  queryKey: ['user'],
  queryFn: () => apiClient<User>('/user'),
});

if (error instanceof APIError) {
  if (error.statusCode === 401) redirect('/login');
  if (error.statusCode === 403) return <Forbidden />;
  if (error.statusCode === 404) return <NotFound />;
}
```

---

## MODULE 7: Testing

### 7.1 Component Testing

```tsx
// components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has accessible name', () => {
    render(<Button aria-label="Close dialog">×</Button>);
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
  });
});
```

### 7.2 Hook Testing

```tsx
// hooks/use-counter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './use-counter';

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('respects initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
});
```

---

## MODULE 8: Integration

### 8.1 With UI/UX Pro Max

| This Skill Adds | Pro Max Adds |
|-----------------|--------------|
| Component architecture | Design tokens |
| State management | Animation presets |
| Performance optimization | Industry heuristics |
| Testing patterns | Color/palette data |

### 8.2 With Vercel Web Design Guidelines

This skill covers React implementation. Web Design Guidelines covers accessibility, performance budgets, and SEO.

### 8.3 Shared Pattern Reference

These patterns appear in multiple skills:

| Pattern | Primary Source | Also In |
|---------|-------------|---------|
| Server/Client Components | This skill | UI/UX Pro Max, Vercel Web |
| Error Boundary | This skill | UI/UX Pro Max |
| Form validation (Zod) | This skill | UI/UX Pro Max |
| useId() | This skill | UI/UX Pro Max |
| prefers-reduced-motion | Vercel Web Design Guidelines | ALL SKILLS |

**Cross-reference rule:** When duplicating a pattern, add a forward reference to the primary source. Do not duplicate implementation details.

---

*Vercel React Best Practices v1.1 — Architecture that scales. Performance by default.*
