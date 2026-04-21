import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

const isVercel = !!process.env.VERCEL

const adapter = isVercel
  ? (await import('@astrojs/vercel')).default()
  : (await import('@astrojs/node')).default({ mode: 'standalone' })

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'server',
  adapter,
})
