# Dark / Light Mode Theme

## Overview

Implementar soporte de tema oscuro y claro con posibilidad de configuración por el usuario. El default es el tema del sistema operativo del cliente, pero el usuario puede forzar light o dark para esta app.

## Scope

### Opciones de tema
1. **System** (default) — sigue `prefers-color-scheme` del OS
2. **Light** — fuerza tema claro
3. **Dark** — fuerza tema oscuro

### Theme Selector
- Ubicación: junto al language selector (header/top bar en mobile, sidebar en desktop)
- Formato: botón/toggle con iconos `Sun` / `Moon` / `Monitor` (lucide-react)
- Click cycle: System → Light → Dark → System
- O dropdown con las 3 opciones

### Persistencia
- Guardar preferencia en localStorage (`theme: 'system' | 'light' | 'dark'`)
- Al cargar la app, aplicar el tema antes del render (evitar flash)

### Implementación técnica

**Mecanismo:** TailwindCSS `darkMode: 'class'` (ya configurado en tailwind.config.js)

**Zustand store:**
```tsx
// src/stores/theme-store.ts
type Theme = 'system' | 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark'; // el tema efectivo aplicado
}
```

**Lógica de aplicación:**
1. Leer de localStorage al iniciar
2. Si `system` → escuchar `window.matchMedia('(prefers-color-scheme: dark)')`
3. Agregar/quitar clase `dark` en `<html>` element
4. Actualizar cuando cambia la preferencia del sistema (listener)

**Script anti-flash (en index.html, antes del root):**
```html
<script>
  (function() {
    const theme = localStorage.getItem('theme-storage');
    const parsed = theme ? JSON.parse(theme) : null;
    const preference = parsed?.state?.theme || 'system';
    const isDark = preference === 'dark' || 
      (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  })();
</script>
```

### Colores
- Las CSS variables de shadcn/ui ya tienen variantes `:root` (light) y `.dark` (dark) definidas en `index.css`
- No se necesitan cambios de colores adicionales — shadcn maneja ambos temas automáticamente

### Componentes afectados
- Todos los componentes usan variables CSS de shadcn (`bg-background`, `text-foreground`, etc.) — ya son compatibles con dark mode
- Verificar que no haya colores hardcodeados (ej: `bg-white` en vez de `bg-background`)
- Los category badges en events necesitan verificarse para contraste en dark mode

## Dependencias nuevas
- Ninguna (TailwindCSS + Zustand ya están en el proyecto)

## Notas
- El flash de tema incorrecto (FOIT) se previene con el script inline en index.html
- Testear ambos temas en todas las páginas
- Los colores de categorías de eventos deben tener buen contraste en ambos modos
