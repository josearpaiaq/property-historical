# Frontend UX Improvements

## Overview

Mejoras de usabilidad y polish en todos los componentes y páginas del frontend.

## Scope

### 1. Password Input — Toggle visibility
- Agregar icono de ojo (Eye / EyeOff de lucide-react) al campo de contraseña
- Al hacer click, alterna entre `type="password"` y `type="text"`
- Presente en LoginPage y RegisterPage
- Crear un componente reutilizable `PasswordInput`

### 2. Iconografía consistente
- Usar exclusivamente **lucide-react** (ya instalado) para todos los iconos
- Iconos a agregar/verificar:
  - Login form: `Mail` para email, `Lock` para password
  - Register form: `User` para name, `Mail` para email, `Lock` para password
  - Properties: `MapPin` para address, `Home` para type
  - Events: `Wrench` para category, `CalendarDays` para date, `DollarSign` para cost
  - Actions: `Pencil` para edit, `Trash2` para delete, `Plus` para crear
  - Navigation: `Menu` para hamburger, `X` para cerrar

### 3. Form feedback
- Loading states en botones (spinner icon al enviar)
- Error messages visibles y descriptivos debajo de cada input donde aplique
- Success feedback (toast notification o redirect con mensaje)

### 4. Empty states
- Ilustraciones/iconos más prominentes cuando no hay datos
- CTAs claros para guiar al usuario (ej: "Add your first property")

### 5. Inputs con iconos (prefix/suffix)
- Crear variante del componente `Input` que soporte iconos a la izquierda
- Usar en: email (Mail), password (Lock), cost (DollarSign), search (Search)

## Technical Notes
- Librería de iconos: `lucide-react` (ya en el proyecto)
- No agregar nuevas dependencias de iconos
- Componentes en `src/components/ui/`
- Mantener accesibilidad: `aria-label` en botones de icono, labels asociados a inputs
