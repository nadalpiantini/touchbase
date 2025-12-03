# Accessibility Guide

TouchBase Academy follows WCAG 2.1 AA standards for accessibility.

## Implemented Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Focus indicators are visible
- Skip to main content link available

### Screen Reader Support
- Semantic HTML elements used throughout
- ARIA labels and roles where needed
- Proper heading hierarchy (h1, h2, h3)
- Form labels associated with inputs
- Error messages linked to form fields

### Visual Accessibility
- Color contrast meets WCAG AA standards
- Focus indicators on all interactive elements
- Loading states announced to screen readers
- Error states clearly indicated

### Form Accessibility
- All inputs have associated labels
- Required fields marked appropriately
- Error messages linked via aria-describedby
- Validation feedback provided

## Component Guidelines

### Buttons
- Use semantic `<button>` elements
- Include aria-label for icon-only buttons
- Disabled state properly indicated
- Loading state announced

### Inputs
- Always use `<label>` elements
- Link error messages via aria-describedby
- Use aria-invalid for error states
- Provide helper text when needed

### Images
- All images have alt text
- Decorative images use empty alt=""
- Informative images have descriptive alt text

## Testing

Run accessibility tests:
```bash
npm run test:e2e -- tests/accessibility.spec.ts
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

