# Official Church Logo Integration Guide

## Logo File Setup

To complete the integration of the official Amazing Grace Baptist Church logo, follow these steps:

### 1. Add the Official Logo File

1. **Save the official logo** as `church-logo.png` in the `public/` folder
2. **Recommended dimensions**: 400x400 pixels (square format)
3. **File format**: PNG with transparent background
4. **File location**: `amazing-grace-church/public/church-logo.png`

### 2. Logo Specifications

The official logo should include:
- **Golden yellow circular outline**
- **Dark blue open book (Bible) at the bottom**
- **Dark blue cross rising from the book**
- **Clean, professional appearance**
- **Transparent background**

### 3. Current Implementation

The website is already configured to use the official logo in:

#### **Navigation Bar**
- Small logo (64x64px) next to church name
- Responsive design - logo shows on all screen sizes

#### **Main Page Hero Section**
- Large logo (128x128px) in glass-morphism container
- Beautiful backdrop blur effect with white border
- Positioned above church name and tagline

#### **All Page Hero Sections**
- About Us, Sermons, Events, Gallery, Contact pages
- Large logo (128x128px) in styled container
- Consistent branding across all pages

#### **Footer**
- Small logo (64x64px) with church name and tagline
- "Saved by Grace, Walking in Light" tagline included

### 4. Logo Component Features

The `ChurchLogo` component includes:
- **Multiple sizes**: sm (64px), md (96px), lg (128px), xl (160px)
- **Responsive design**: Adapts to different screen sizes
- **Error handling**: Fallback if image fails to load
- **Optimized loading**: Next.js Image optimization
- **Accessibility**: Proper alt text for screen readers

### 5. Styling Details

#### **Main Page Hero**
```css
- Glass-morphism container with backdrop blur
- White/transparent background with border
- Large shadow for depth
- Positioned above church name
```

#### **Navigation**
```css
- Small size for header
- Clean integration with text
- Responsive spacing
```

#### **Other Pages**
```css
- Consistent circular container
- Primary color border
- Shadow for depth
- Centered positioning
```

### 6. Brand Consistency

The logo integration maintains:
- **Consistent sizing** across all pages
- **Professional appearance** with proper spacing
- **Church colors** (deep blue and gold) in containers
- **Responsive design** for all devices
- **Accessibility standards** with proper alt text

### 7. File Structure

```
amazing-grace-church/
├── public/
│   └── church-logo.png          # Official logo file
├── src/
│   ├── components/
│   │   └── church-logo.tsx      # Logo component
│   └── app/
│       ├── page.tsx             # Main page with hero logo
│       ├── about/page.tsx        # About page with logo
│       ├── sermons/page.tsx      # Sermons page with logo
│       ├── events/page.tsx      # Events page with logo
│       ├── gallery/page.tsx     # Gallery page with logo
│       ├── contact/page.tsx     # Contact page with logo
│       └── layout.tsx           # Navigation with logo
```

### 8. Next Steps

1. **Add the official logo file** to `public/church-logo.png`
2. **Test the website** to ensure logo displays correctly
3. **Verify responsive design** on different screen sizes
4. **Check accessibility** with screen readers

The website is fully prepared for the official logo integration!

