# Mobile-First Responsive Design

## Overview

Rediseñar todas las vistas del frontend con enfoque mobile-first. Los breakpoints deben construirse de menor a mayor (mobile → tablet → desktop).

## Scope

### Vistas a adaptar
- **LoginPage** — formulario centrado, full-width en mobile
- **RegisterPage** — formulario centrado, full-width en mobile
- **DashboardPage** — cards apiladas en mobile, grid en desktop
- **PropertiesPage** — lista vertical en mobile, grid en tablet/desktop
- **PropertyDetailPage** — timeline vertical, formulario de evento full-width en mobile
- **AppLayout** — sidebar colapsable en mobile, hamburger menu

### Breakpoints (TailwindCSS)
- `< 640px` — mobile (default, diseñar primero aquí)
- `sm: 640px` — mobile landscape / small tablet
- `md: 768px` — tablet
- `lg: 1024px` — desktop

### Requisitos

1. **AppLayout / Navegación**
   - Mobile: sidebar oculto, hamburger button en top bar, overlay menu al abrir
   - Tablet+: sidebar visible fijo

2. **Cards y Grids**
   - Mobile: 1 columna
   - Tablet: 2 columnas
   - Desktop: 3 columnas

3. **Formularios**
   - Mobile: inputs full-width, stacked verticalmente
   - Desktop: grid de 2-3 columnas donde aplique

4. **Tipografía**
   - Mobile: títulos más pequeños (text-2xl → text-xl)
   - Desktop: títulos normales

5. **Touch targets**
   - Botones mínimo 44x44px en mobile
   - Spacing adecuado entre elementos interactivos

6. **Event Timeline (PropertyDetailPage)**
   - Mobile: cards stacked full-width
   - Desktop: mantener layout actual con spacing

## Technical Notes
- Usar clases de TailwindCSS responsivas (`sm:`, `md:`, `lg:`)
- No usar media queries custom a menos que sea estrictamente necesario
- Testear con Chrome DevTools device emulation (iPhone SE, iPhone 14, iPad)
