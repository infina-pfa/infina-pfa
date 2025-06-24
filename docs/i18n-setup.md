# Internationalization (i18n) Setup

## Overview

This project uses `react-i18next` for internationalization with Vietnamese as the default language and English as a secondary option.

## Configuration

### Default Language

- **Primary**: Vietnamese (vi)
- **Fallback**: Vietnamese (vi)
- **Secondary**: English (en)

### Files Structure

```
lib/
  i18n.ts               # Main i18n configuration
components/
  providers/
    i18n-provider.tsx   # React context provider
  ui/
    language-switcher.tsx # Language switcher component
hooks/
  use-translation.ts    # Custom translation hook
```

## Usage

### Basic Translation

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t("heroTitle")}</h1>;
}
```

### Using Custom Hook

```tsx
import { useAppTranslation } from "@/hooks/use-translation";

function MyComponent() {
  const { t, isVietnamese, changeLanguage } = useAppTranslation();

  return (
    <div>
      <h1>{t("heroTitle")}</h1>
      {isVietnamese && <p>This is Vietnamese mode</p>}
    </div>
  );
}
```

## Language Switcher

### Hidden by Default

The language switcher is hidden by default as requested. It can be made visible by:

1. **Development Mode**: Automatically shown in development environment
2. **Manual Override**: Pass `isVisible={true}` to `LanguageSwitcher` component

### Usage

```tsx
import { LanguageSwitcher, DevLanguageSwitcher } from '@/components/ui/language-switcher';

// Hidden by default
<LanguageSwitcher />

// Visible only in development
<DevLanguageSwitcher />

// Always visible
<LanguageSwitcher isVisible={true} />
```

## Adding New Translations

### 1. Update i18n.ts

Add new keys to both Vietnamese and English sections:

```typescript
// In lib/i18n.ts
const resources = {
  vi: {
    translation: {
      newKey: "Văn bản tiếng Việt",
      // ... other translations
    },
  },
  en: {
    translation: {
      newKey: "English text",
      // ... other translations
    },
  },
};
```

### 2. Use in Components

```tsx
const { t } = useTranslation();
return <p>{t("newKey")}</p>;
```

## Features

- ✅ Vietnamese as default language
- ✅ English as secondary language
- ✅ Hidden language switcher (visible in dev mode)
- ✅ Persistent language selection (localStorage)
- ✅ Automatic language detection
- ✅ TypeScript support
- ✅ SSR compatibility
- ✅ Loading states during initialization

## Browser Support

- Supports all modern browsers
- Fallback to Vietnamese for unsupported languages
- Respects user's browser language preference
