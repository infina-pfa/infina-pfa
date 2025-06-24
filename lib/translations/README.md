# Translation Structure

This directory contains organized translations for the Infina PFA application, structured by page/section for better maintainability.

## 📁 Directory Structure

```
lib/translations/
├── vi/                     # Vietnamese translations
│   ├── common.ts          # Navigation, language, general actions
│   ├── hero.ts            # Hero section and AI chat content
│   ├── how-it-works.ts    # How it works section
│   ├── financial-stages.ts # Financial stages section
│   ├── features.ts        # Key features section
│   ├── testimonials.ts    # Testimonials section
│   ├── cta.ts             # Call-to-action section
│   ├── footer.ts          # Footer content
│   └── index.ts           # Combined Vietnamese translations
├── en/                     # English translations
│   ├── common.ts          # Navigation, language, general actions
│   ├── hero.ts            # Hero section and AI chat content
│   ├── how-it-works.ts    # How it works section
│   ├── financial-stages.ts # Financial stages section
│   ├── features.ts        # Key features section
│   ├── testimonials.ts    # Testimonials section
│   ├── cta.ts             # Call-to-action section
│   ├── footer.ts          # Footer content
│   └── index.ts           # Combined English translations
└── README.md              # This documentation
```

## 🎯 Page/Section Breakdown

### Common (`common.ts`)

- Navigation items (home, features, about, contact)
- Language settings (language, vietnamese, english)
- General action buttons (getStarted, learnMore, startFreeJourney)

### Hero (`hero.ts`)

- Main hero section content
- AI coach chat interface content
- Primary call-to-action messaging

### How It Works (`how-it-works.ts`)

- Process explanation section
- Step-by-step descriptions
- Onboarding flow content

### Financial Stages (`financial-stages.ts`)

- Different financial journey stages
- Stage descriptions and benefits
- Progressive advice content

### Features (`features.ts`)

- Key product features
- Feature descriptions and benefits
- Feature labels and indicators

### Testimonials (`testimonials.ts`)

- Customer testimonials
- Success stories
- Social proof content

### CTA (`cta.ts`)

- Call-to-action sections
- Conversion-focused messaging
- Sign-up prompts

### Footer (`footer.ts`)

- Footer navigation links
- Company information
- Newsletter subscription
- Legal links and copyright

## 🔧 Usage

The translations are automatically combined in each language's `index.ts` file and imported into the main `lib/i18n.ts` file. No changes needed to existing translation usage in components.

```typescript
// In React components, continue using translations as before:
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("heroMainTitle")}</h1>
      <p>{t("heroDescription")}</p>
    </div>
  );
};
```

## ✨ Benefits

1. **Better Organization**: Translations are grouped by page/section
2. **Easier Maintenance**: Smaller files are easier to manage
3. **Team Collaboration**: Multiple team members can work on different sections
4. **Reduced Merge Conflicts**: Separate files reduce Git conflicts
5. **Cleaner Code**: More focused and readable translation files

## 📝 Adding New Translations

1. Add the translation key to the appropriate section file (e.g., `hero.ts` for hero content)
2. Add the same key to both Vietnamese (`vi/`) and English (`en/`) versions
3. The translation will automatically be available throughout the app

## 🚀 Future Enhancements

- Add more languages by creating new language directories (e.g., `zh/`, `fr/`)
- Add TypeScript interfaces for translation keys to ensure type safety
- Implement translation validation scripts to ensure all keys exist in all languages
