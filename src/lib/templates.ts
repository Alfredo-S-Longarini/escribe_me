import type { TemplateKey, BookStatus } from '../types'

export interface TemplateDefinition {
  label: string
  symbol: string
  description: string
  detail: string
  coverColor: string
  accentColor: string
  defaultTitle: string
}

export const TEMPLATES: Record<TemplateKey, TemplateDefinition> = {
  diary: {
    label: 'Diario',
    symbol: '◐',
    description: 'Entradas por fecha, tono íntimo',
    detail: 'Para los pensamientos que necesitan salir cada día. Sin estructura impuesta, solo la fecha y vos.',
    coverColor: '#1e1408',
    accentColor: '#c9a96e',
    defaultTitle: 'Mi diario',
  },
  novel: {
    label: 'Novela',
    symbol: '◈',
    description: 'Capítulos, partes, notas de trama',
    detail: 'Para las historias largas, los mundos que construís, los personajes que te acompañan.',
    coverColor: '#140e1e',
    accentColor: '#a08ec9',
    defaultTitle: 'Sin título',
  },
  story: {
    label: 'Cuento',
    symbol: '◇',
    description: 'Estructura corta y libre',
    detail: 'Para las historias que caben en pocas páginas. Brevedad con profundidad.',
    coverColor: '#0e1a14',
    accentColor: '#7ec9a0',
    defaultTitle: 'Cuento sin título',
  },
  poetry: {
    label: 'Poesía',
    symbol: '◎',
    description: 'Editor centrado, espaciado poético',
    detail: 'Para las palabras que necesitan forma, ritmo y silencio entre ellas.',
    coverColor: '#1a0e14',
    accentColor: '#c97e9e',
    defaultTitle: 'Poemas',
  },
  letter: {
    label: 'Carta',
    symbol: '◰',
    description: 'A alguien, a ti misma, al mundo',
    detail: 'Para decir lo que no encontraste manera de decir de otra forma. El destinatario sos vos.',
    coverColor: '#0e141a',
    accentColor: '#7e9ec9',
    defaultTitle: 'Carta sin destinatario',
  },
  free: {
    label: 'Escritura libre',
    symbol: '○',
    description: 'Hoja en blanco, sin reglas',
    detail: 'Sin estructura, sin formato, sin presión. Solo escribí. Lo demás no importa.',
    coverColor: '#141a0e',
    accentColor: '#9ec97e',
    defaultTitle: 'Páginas libres',
  },
  essay: {
    label: 'Ensayo',
    symbol: '◑',
    description: 'Reflexión con título e intro',
    detail: 'Para ordenar el pensamiento, explorar una idea, argumentar con honestidad.',
    coverColor: '#1a160e',
    accentColor: '#c9b87e',
    defaultTitle: 'Reflexión sin título',
  },
}

export const STATUS_LABELS: Record<BookStatus, string> = {
  draft:       'Borrador',
  in_progress: 'En progreso',
  finished:    'Terminado',
}

export const STATUS_STYLES: Record<BookStatus, { bg: string; color: string }> = {
  draft:       { bg: '#2a2015', color: '#8a7560' },
  in_progress: { bg: '#1e2a1a', color: '#6a9e6a' },
  finished:    { bg: '#141e2a', color: '#6a8a9e' },
}
