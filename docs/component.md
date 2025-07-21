# Infina PFA - Base & Reusable UI Components Guide

## 📦 Component Categories

### 🔘 **Basic Components**

#### Button (`button.tsx`)

- **Purpose**: Primary interactive element
- **Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `success`, `warning`, `highlight`
- **Sizes**: `default`, `sm`, `lg`, `icon`
- **Features**: `asChild` prop for composition, full keyboard accessibility

```typescript
<Button variant="default" size="lg">
  Click me
</Button>
```

#### Input (`input.tsx`)

- **Purpose**: Basic text input with consistent styling
- **Features**: Error states, borderless design, focus indicators
- **Props**: Extends native input props + `error` boolean

```typescript
<Input placeholder="Enter text" error={hasError} className="custom-class" />
```

#### Card (`card.tsx`)

- **Purpose**: Container component for content grouping
- **Composition**: `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`, `CardAction`
- **Features**: Hover effects, grid-based layout system

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction>
      <Button variant="ghost">Action</Button>
    </CardAction>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
</Card>
```

### 📝 **Form Components**

#### FormInput (`form-input.tsx`)

- **Purpose**: Enhanced input with label, validation, and error handling
- **Features**: Required field indicators, error states, validation feedback
- **Integration**: Works with form validation libraries

```typescript
<FormInput
  label="Email Address"
  value={email}
  onChange={setEmail}
  error={errors.email}
  touched={touched.email}
  required
/>
```

#### MoneyInput (`money-input.tsx`)

- **Purpose**: Specialized input for currency values
- **Features**: VND formatting, thousand separators, editing states
- **Validation**: Built-in number parsing and formatting

```typescript
<MoneyInput
  label="Amount"
  value={amount}
  onChange={setAmount}
  error={errors.amount}
/>
```

#### Select (`select.tsx`)

- **Purpose**: Dropdown selection with rich styling
- **Built on**: Radix UI Select primitive
- **Features**: Search, keyboard navigation, custom styling

```typescript
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### 🖼️ **Layout Components**

#### AppLayout (`app-layout.tsx`)

- **Purpose**: Main application shell
- **Features**: Responsive sidebar, mobile header, authentication-aware
- **Structure**: Sidebar + Main content area

```typescript
<AppLayout>
  <YourPageContent />
</AppLayout>
```

### 💬 **Interactive Components**

#### Dialog (`dialog.tsx`)

- **Purpose**: Modal dialogs and popups
- **Built on**: Radix UI Dialog primitive
- **Features**: Portal rendering, focus management, escape key handling

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    Dialog content
  </DialogContent>
</Dialog>
```

#### Sheet (`sheet.tsx`)

- **Purpose**: Side panels and drawers
- **Features**: Multiple positions (left, right, top, bottom)
- **Use Cases**: Mobile menus, filter panels, detail views

### 🎯 **Specialized Components**

#### CircularProgress (`circular-progress.tsx`)

- **Purpose**: Progress indicators for loading states
- **Features**: Customizable size, color, and animation

#### Skeleton (`skeleton.tsx`)

- **Purpose**: Loading placeholders
- **Features**: Consistent with design system, multiple sizes

#### Avatar (`avatar.tsx`)

- **Purpose**: User profile images with fallbacks
- **Features**: Automatic fallback generation, multiple sizes

## 📋 Usage Guidelines

### 1. **Import Pattern**

```typescript
import { Button, Input, Card } from "@/components/ui";
```

### 2. **Customization**

```typescript
// Extend with additional classes
<Button className="w-full mt-4" variant="outline">
  Custom Button
</Button>

// Override specific styles when needed
<Input className="border-2 border-red-500" error />
```

### 3. **Composition**

```typescript
// Combine components for complex UIs
<Card>
  <CardHeader>
    <CardTitle>User Settings</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <FormInput label="Name" />
    <MoneyInput label="Budget" />
    <Button variant="success">Save Changes</Button>
  </CardContent>
</Card>
```

### 4. **Error Handling**

```typescript
// Consistent error state handling
const [errors, setErrors] = useState({});

<FormInput
  error={errors.email}
  touched={touched.email}
  // Component handles error styling automatically
/>;
```

## 🌍 Internationalization Support

All text-displaying components support the translation system:

```typescript
import { useAppTranslation } from "@/hooks/use-translation";

const { t } = useAppTranslation();

<Button>{t("save")}</Button>
<FormInput label={t("emailLabel")} />
```

## 🎯 Component Development Guidelines

When adding new components to the system:

1. **Follow Naming Conventions**: Use descriptive, kebab-case filenames
2. **Implement Forward Refs**: For all interactive components
3. **Use CVA for Variants**: Consistent styling approach
4. **Add Data Attributes**: For testing and styling hooks
5. **Export from Index**: Maintain the centralized export pattern
6. **Document Props**: Use TypeScript interfaces with JSDoc comments
7. **Test Accessibility**: Ensure keyboard navigation and screen reader support

This component system provides a solid foundation for building consistent, accessible, and maintainable user interfaces throughout the Infina PFA application.
