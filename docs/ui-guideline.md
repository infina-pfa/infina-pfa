### 📘 Infina UI Design Guideline (Flat & Borderless – 2025)

**Inspired by Wise visual style, aligned with Infina brand (Nunito + #0055FF)**

---

#### 1. 🎯 Design Philosophy

- **Flat Design**: No shadows or depth-based effects.
- **Borderless**: No visible outlines or container borders.
- **Soft Rounding**: Use border-radius to maintain modern, approachable feel.
- **Whitespace Over Dividers**: Structure layout via spacing instead of lines.
- **Friendly & Professional**: Guided by positivity, clarity, and trust.

---

#### 2. 🔤 Typography – Nunito

| Use Case            | Size (pt) | Weight        |
| ------------------- | --------- | ------------- |
| H1 – Hero/Headline  | 48–64     | ExtraBold     |
| H2 – Section Header | 32–40     | Bold          |
| H3 – Subhead        | 24–32     | Medium/Bold   |
| Body Text           | 14–20     | Regular       |
| Caption/Label       | 10–12     | Light/Regular |

- Only capitalize first letters (e.g., "Tài khoản sinh lời")
- Line-height: 1.5x font size
- No shadows or effects

---

#### 3. 🎨 Color System

**Primary Color**

- Bright Royal Blue: `#0055FF`

**Support Colors**

- Success: `#2ECC71`
- Warning: `#FFC107`
- Error: `#F44336`
- Info/Highlight: `#FF9800`

**Backgrounds**

- App: `#F6F7F9` or white
- Components: White or light neutral blocks (`#F0F2F5`)

**Divider (if needed)**: `#E0E0E0`, subtle only

---

#### 4. 🧱 Layout & Spacing

- **Grid**: 8pt base spacing system
- **Padding**: 16–32px for section blocks
- **Cards**:

  - No borders
  - Background: white
  - Border-radius: 12–16px
  - Shadow: none

- **Mobile-first responsive layout**

---

#### 5. 🧩 Components

**Buttons**

- Primary: `#0055FF` background, white text, border-radius 8–12px
- Secondary: Text-only, underline on hover
- No border unless ghost style; no shadow

**Inputs**

- Fill background: `#F0F2F5`
- No border
- Focus: `2px` bottom border in `#0055FF`
- Error: Red bottom border + message

**Cards/Sections**

- Flat surface, white or light gray background
- Border-radius: 12px
- Padding: 24–32px
- No border or outline

**Modals**

- No outline or shadow
- Rounded corners: 12px
- Full-width mobile layout

---

#### 6. 📱 Icons & Imagery

- **Icons**: Use Lucide/Feather/Heroicons, stroke width 1.5–2px
- **No background or circle wraps**
- **Imagery**:

  - Characters with positive emotions
  - 2/3 face focus
  - Neutral/light-toned backgrounds

---

#### 7. 🔁 Interaction & Feedback

- **Hover**: Tint or underline (no shadows)
- **Active**: Bold text or filled background
- **Disabled**: 50% opacity, cursor-not-allowed
- **Loading**: Use skeleton or linear bar
- **No spinners unless necessary**

---

#### 8. 🧰 Tooling

- **Font**: Nunito (`font-family: 'Nunito', sans-serif;`)
- **Framework**: TailwindCSS + shadcn/ui (custom tokens)
- **Icons**: Lucide
