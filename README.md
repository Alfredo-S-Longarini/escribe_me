# Escribe.me

Un refugio digital para escribir sin filtros, sin juicios y sin presión.

---

## Stack

- **Astro 4** — framework principal con SSR
- **React** — islands interactivos (formularios, editor, partículas)
- **Tailwind CSS** — estilos con paleta personalizada
- **Shadcn/ui** — componentes base (próximas iteraciones)
- **Supabase** — base de datos, autenticación y storage
- **TipTap** — editor de texto rico (próxima iteración)
- **Framer Motion** — animaciones y transiciones
- **Zod + React Hook Form** — validación de formularios

---

### Instalar dependencias

```bash
npm install
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── auth/           → LoginForm, RegisterForm
│   ├── particles/      → ParticlesBackground
│   └── shared/         → LoadingScreen
├── layouts/
│   ├── BaseLayout.astro
│   ├── AuthLayout.astro
│   └── AppLayout.astro
├── lib/
│   ├── supabase.ts     → cliente Supabase (browser)
│   └── phrases.ts      → frases motivadoras
├── pages/
│   ├── index.astro     → Landing
│   ├── 404.astro
│   └── auth/
│       ├── login.astro
│       └── register.astro
├── styles/
│   └── global.css
├── middleware.ts        → protección de rutas
└── env.d.ts
```

---
