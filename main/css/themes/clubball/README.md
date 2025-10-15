# ClubBall Theme

**Baseball club branding for Chamilo LMS**

A modern, professional theme designed for baseball clubs using PelotaPack.

## Features

- Caribbean-inspired color palette (sky blue + field green)
- Mobile-responsive design
- Dark mode optimized for reduced eye strain
- Baseball-themed visual elements
- Optimized for sports organization workflows

## Installation

### 1. Copy Theme Files

This directory should already be in place at:
```
chamilo/main/css/themes/clubball/
```

If not, copy the `clubball/` directory to `main/css/themes/`

### 2. Activate in Chamilo

1. Log in as administrator
2. Go to **Administration** → **Settings** → **Platform**
3. In the **Appearance** section, find **Visual theme**
4. Select **clubball** from the dropdown
5. Click **Save settings**

## Customization

### Color Palette

Edit `variables.css` to match your club colors:

```css
:root {
    --club-primary: #your-color;      /* Main brand color */
    --club-secondary: #your-color;    /* Secondary accent */
    --club-dark: #your-color;         /* Background */
}
```

### Typography

Change font family in `variables.css`:

```css
:root {
    --club-font-family: 'Your Font', system-ui, sans-serif;
}
```

### Logo

To add your club logo:

1. Upload logo to `chamilo/main/img/`
2. Edit `theme.css` and add:

```css
.logo::before {
    content: url('/main/img/your-logo.png');
    margin-right: 0.5rem;
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

Designed for baseball clubs in the Dominican Republic and worldwide.

Part of the [PelotaPack](../../../plugin/pelota_pack/) project.
