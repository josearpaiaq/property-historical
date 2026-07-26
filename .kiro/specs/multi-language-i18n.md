# Multi-language Support (i18n)

## Overview

Implementar soporte multilenguaje en la aplicación con mínimo español e inglés. El usuario debe poder cambiar el idioma en cualquier momento mediante un selector siempre visible.

## Scope

### Idiomas
- **Español (es)** — default
- **English (en)**

### Language Selector
- Siempre visible en la UI (no escondido en settings)
- Ubicación: header/top bar en mobile, sidebar footer en desktop
- Formato: dropdown/select con bandera + código (🇪🇸 ES / 🇺🇸 EN)
- La selección se persiste en localStorage
- Al recargar, mantiene el idioma seleccionado

### Strings a traducir
1. **Navegación:** Dashboard, Properties, Logout
2. **Auth pages:** Sign In, Create Account, Email, Password, Name, labels, botones, error messages
3. **Dashboard:** Welcome back, Total Properties, Your Properties, No properties yet
4. **Properties:** Add Property, Property Name, Address, Type (house, apartment, etc.), Delete confirmation
5. **Events:** Log Event, Event Title, Date, Cost, Category names, Status names, Description
6. **Reminders:** títulos y acciones
7. **Common:** Save, Cancel, Delete, Edit, Loading, Error messages, Empty states

### Implementación técnica

**Librería:** `react-i18next` + `i18next`
- Lightweight, bien mantenido, estándar de la industria React

**Estructura de archivos:**
```
frontend/src/
├── i18n/
│   ├── index.ts          # i18next config + init
│   ├── locales/
│   │   ├── en.json       # English translations
│   │   └── es.json       # Spanish translations
```

**Uso en componentes:**
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.welcome')}</h1>;
}
```

**Persistencia:** `i18next-browser-languagedetector` para detectar idioma del browser + localStorage para override del usuario.

## Dependencias nuevas
- `react-i18next` — React bindings
- `i18next` — core i18n framework
- `i18next-browser-languagedetector` — detectar idioma del navegador

## Notas
- No traducir contenido del usuario (nombres de propiedades, eventos, etc.)
- Las categorías y status de eventos SÍ se traducen (son enums fijos)
- Los mensajes de error del backend se mapean a claves i18n en el frontend
