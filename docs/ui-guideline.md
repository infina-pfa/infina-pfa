# 📘 Infina UI Design Guideline (2025 Edition)

**Style:** Flat & Borderless  
**Inspired by:** Wise Design System  
**Aligned with:** Infina Branding (Nunito Font & Brand Colors)

This guideline establishes a unified visual language for Infina's financial web application. It bridges the design and development teams, ensuring consistency, usability, and brand clarity across all digital touchpoints.

---

## 🎯 1. Design Philosophy

- **Flat & Minimalist:** No use of shadows or gradients. Depth is expressed through layout, contrast, and typography.
- **Borderless Layout:** Separate elements using **whitespace**, **color blocks**, and **text hierarchy** rather than visible borders.
- **Clean UI:** Focus on readability, clarity, and calmness. Avoid visual noise.
- **Functional Aesthetic:** Every design choice should support user trust, clarity of financial data, and actionability.

---

## 🏷️ 2. Brand Identity

- **Logo Usage:**
  - Full-color logo only on white or light backgrounds.
  - Monochrome (white or black) logo when necessary on colored backgrounds.
  - Clear space: Minimum padding equals the height of the letter "I" in "Infina".
- **Tone of Voice:**
  - Friendly, trustworthy, and simple. Avoid jargon.
  - Use action-driven phrasing: _"Grow your money"_ instead of _"Investment options"_.
- **Font:** Nunito (Google Font)
  - Rounded, modern, humanistic sans-serif.
  - Use exclusively across all UI text unless in charts or code blocks.

---

## 🔠 3. Typography System

| Style     | Size | Weight    | Line Height | Case      |
| --------- | ---- | --------- | ----------- | --------- |
| H1        | 40px | Bold      | 48px        | Sentence  |
| H2        | 32px | Bold      | 40px        | Sentence  |
| H3        | 24px | Semi-Bold | 32px        | Sentence  |
| H4        | 20px | Semi-Bold | 28px        | Sentence  |
| H5        | 18px | Medium    | 24px        | Sentence  |
| H6        | 16px | Medium    | 24px        | Sentence  |
| Body      | 16px | Regular   | 24px        | Sentence  |
| Caption   | 14px | Regular   | 20px        | Sentence  |
| Button LG | 16px | Semi-Bold | 20px        | Uppercase |
| Button SM | 14px | Semi-Bold | 18px        | Uppercase |

> ❌ Avoid text shadows, outlines, or letter spacing beyond +2%.

---

## 🎨 4. Color System

| Purpose      | Color Code | Usage                          |
| ------------ | ---------- | ------------------------------ |
| Primary      | #0055FF    | CTA, highlights, links         |
| Success      | #2ECC71    | Confirmation, growth, verified |
| Warning      | #FFC107    | Warnings, caution              |
| Highlight    | #FF9800    | Promo tags, attention          |
| Error        | #F44336    | Validation errors, critical    |
| Text Primary | #111827    | Main content                   |
| Text Muted   | #6B7280    | Secondary labels               |
| Background   | #F9FAFB    | App background                 |
| Surface      | #FFFFFF    | Cards, modals                  |
| Divider      | #E5E7EB    | Line dividers                  |

> ✅ Maintain sufficient contrast. See Section 12 for accessibility ratios.

---

## 📐 5. Layout & Grid System

- **Grid:** 12-column layout
- **Column Gutter:** 24px
- **Max Width (Desktop):** 1280px
- **Spacing Scale:** 4px base (4, 8, 12, 16, 24, 32, 40, 64...)
- **Content Padding:** 24px (desktop), 16px (mobile)
- **Section Padding:** 64px vertical on large screens, 40px on smaller screens
- **Cards & Blocks:**
  - Border-radius: 12px
  - Padding inside: 24px

---

## 🧩 6. Components

### Buttons

| Type      | Default                | Hover          | Disabled     |
| --------- | ---------------------- | -------------- | ------------ |
| Primary   | #0055FF                | #0041CC        | #B3CCFF text |
| Secondary | #FFFFFF border #0055FF | Filled #0055FF | Muted text   |

- Radius: Full rounded (9999px)
- Padding: 12px 24px
- Icon spacing: 8px to left/right of label

### ✍️ Input

- **Label**: Top-aligned, **#111827**, 14px, **Bold**
- **Label Spacing**: 4px gap between label and input box
- **Placeholder**: Optional
- **Background**: `transparent`
- **Border**: `1px solid transparent` (default)
- **Border Bottom**: `1px solid #E5E7EB`
- **Focus State**: `2px solid #0055FF` (primary color) (bottom border)
- **Error**: `#F44336` bottom border + message
- **Disabled**: Text color `#9CA3AF`, border `#E5E7EB`
- **Padding**: 16px top & bottom, 0 left & right
- **Font**: Nunito Regular, 16px
- **Input Box Height**: 48px (content + padding only, not including label)
- **Radius**: None

### Input Validation Rules

- **Name/Title**: Min 3 characters, max 40 characters
- **Description**: Max 100 characters
- **Chat Message**: Max 500 characters
- **Money**: Max value 999,999,999,999,999 VND with proper formatting
- **Number**: Max value 999,999,999,999 with proper formatting
- **See full documentation**: [Input Validation Rules](/docs/ui-input-rules.md)

### Cards

- Use `#FFFFFF` background
- Drop shadow: ❌ None
- Separate content via padding and headers

### 📦 Card (Clickable)

- Background: #FFFFFF
- Radius: 12px
- Padding: 16px (mobile), 24px (desktop)
- No border, no shadow
- Entire card clickable
- Hover: #F9FAFF bg or subtle border
- Active: `1px solid #0055FF`
- No button inside
- Use `tabindex="0"` & `aria-label` for accessibility

### Modals

- Fullscreen on mobile; centered card on desktop
- Close icon top-right (24px)
- Max-width: 480px

---

## 🧠 7. Icons & Visuals

- Use **Lucide** or **Feather Icons** (line style)
  - Default color: #6B7280
  - Active/Primary: #0055FF
- Size: 20px or 24px depending on text size
- Image Style:
  - 2/3 character close-up
  - Neutral or soft gradient backgrounds
  - Always positive, calm emotional tone

---

## ⚙️ 8. Interaction & Feedback

### States

| Type    | Style                                                  |
| ------- | ------------------------------------------------------ |
| Hover   | Background tint (8% of primary), underline link        |
| Active  | Darker shade or inner border highlight                 |
| Error   | Border or text in `#F44336`, error message below field |
| Success | Inline success message, green icon                     |

### Cursor Behavior

- **All clickable elements** must use `cursor: pointer`
- This includes: buttons, links, tabs, cards (when clickable), icons (when interactive)
- Non-interactive elements should maintain default cursor

### Loaders

- **Skeleton loaders:** use light grey blocks (`#E5E7EB`)
- **Progress indicators:** thin linear bar or spinning icon

### 🧭 Tabs / Segmented Control

- **Variants**: Tab or segmented toggle

**Tab**

- Font: 14px semi-bold
- Active: #0055FF, underline 2px
- Inactive: #6B7280
- Padding: 8px 16px

**Segmented**

- Background: #F3F4F6
- Radius: 9999px
- Active: #0055FF bg, white text
- Inactive: Transparent bg, #6B7280 text
- Padding: 6px 16px

---

## 📱 9. Responsive Behavior

| Breakpoint   | Screen Width | Notes                           |
| ------------ | ------------ | ------------------------------- |
| Desktop      | ≥1440px      | Full layout, 12 columns         |
| Large Tablet | ≥1024px      | 8–10 columns layout             |
| Tablet       | ≥768px       | Stack elements, hide nav items  |
| Mobile       | <480px       | Single-column, larger tap areas |

- Stack columns vertically on mobile
- Prioritize primary actions at top or bottom

---

## 🧭 10. Navigation & Hierarchy

- **Top Navbar:** Sticky, height 64px, contains logo, nav items, and avatar
- **Tab Nav (Internal Sections):**
  - Underline active tab in `#0055FF`
  - Use icons optionally beside text
- **Hierarchy Rules:**
  - H1: Page Title
  - H2: Section Headings
  - H3/H4: Nested content
  - Use dividers (`#E5E7EB`) between sections

---

## 🎞️ 11. Motion & Transitions

| Use Case         | Duration | Easing      |
| ---------------- | -------- | ----------- |
| Button Hover     | 150ms    | ease-in-out |
| Modal Open/Close | 200ms    | ease-in-out |
| Tab Transition   | 250ms    | ease-in-out |

> ❌ Avoid bounce, spring, or overshoot effects  
> ✅ Use subtle fade, slide, or scale animations

---

## ♿ 12. Accessibility Guidelines

- **Color Contrast:** WCAG 2.1 AA compliance
  - Text vs. background ≥ 4.5:1
  - Large text ≥ 3:1
- **Keyboard Navigation:** All interactive elements must be focusable
- **Focus State:** Outline or border (2px) in `#0055FF`
- **Alt Text:** All meaningful images and icons
- **ARIA Labels:** Use for inputs, error messages, role identification

---

## ✅ 13. DOs & DON'Ts Table

| ✅ DOs                                      | ❌ DON'Ts                         |
| ------------------------------------------- | --------------------------------- |
| Use whitespace for separation               | Add borders to divide content     |
| Stick to Nunito font                        | Mix multiple typefaces            |
| Use consistent icon sizing (20–24px)        | Scale icons arbitrarily           |
| Use solid primary for actions               | Use gradients or shadows          |
| Align to 4px spacing system                 | Use inconsistent paddings/margins |
| Maintain consistent modal width (max 480px) | Use fullscreen modals on desktop  |

---
