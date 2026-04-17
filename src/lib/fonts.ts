export interface FontOption {
  key: string
  label: string
  family: string
  category: 'serif' | 'sans-serif' | 'monospace'
}

export const EDITOR_FONTS: FontOption[] = [
  // Serif
  { key: 'lora',         label: 'Lora',            family: "'Lora', Georgia, serif",              category: 'serif' },
  { key: 'crimson',      label: 'Crimson Pro',      family: "'Crimson Pro', Georgia, serif",        category: 'serif' },
  { key: 'garamond',     label: 'EB Garamond',      family: "'EB Garamond', Georgia, serif",        category: 'serif' },
  { key: 'merriweather', label: 'Merriweather',     family: "'Merriweather', Georgia, serif",       category: 'serif' },
  { key: 'playfair',     label: 'Playfair Display', family: "'Playfair Display', Georgia, serif",   category: 'serif' },
  { key: 'source-serif', label: 'Source Serif 4',   family: "'Source Serif 4', Georgia, serif",     category: 'serif' },
  { key: 'spectral',     label: 'Spectral',         family: "'Spectral', Georgia, serif",           category: 'serif' },
  { key: 'cormorant',    label: 'Cormorant',        family: "'Cormorant Garamond', Georgia, serif", category: 'serif' },
  { key: 'georgia',      label: 'Georgia',          family: 'Georgia, serif',                       category: 'serif' },
  { key: 'times',        label: 'Times New Roman',  family: "'Times New Roman', Times, serif",      category: 'serif' },
  // Sans-serif
  { key: 'dm-sans',      label: 'DM Sans',          family: "'DM Sans', system-ui, sans-serif",     category: 'sans-serif' },
  { key: 'inter',        label: 'Inter',            family: "'Inter', system-ui, sans-serif",        category: 'sans-serif' },
  { key: 'source-sans',  label: 'Source Sans 3',    family: "'Source Sans 3', system-ui, sans-serif",category: 'sans-serif' },
  { key: 'nunito',       label: 'Nunito',           family: "'Nunito', system-ui, sans-serif",       category: 'sans-serif' },
  { key: 'open-sans',    label: 'Open Sans',        family: "'Open Sans', system-ui, sans-serif",    category: 'sans-serif' },
  { key: 'raleway',      label: 'Raleway',          family: "'Raleway', system-ui, sans-serif",      category: 'sans-serif' },
  { key: 'arial',        label: 'Arial',            family: 'Arial, Helvetica, sans-serif',          category: 'sans-serif' },
  // Monospace
  { key: 'courier',      label: 'Courier New',      family: "'Courier New', Courier, monospace",     category: 'monospace' },
  { key: 'jetbrains',    label: 'JetBrains Mono',   family: "'JetBrains Mono', monospace",           category: 'monospace' },
]

export const FONT_CATEGORIES = [
  { key: 'serif',      label: 'Serif' },
  { key: 'sans-serif', label: 'Sin Serif' },
  { key: 'monospace',  label: 'Monoespaciada' },
] as const

export function getFontFamily(key: string): string {
  return EDITOR_FONTS.find(f => f.key === key)?.family ?? EDITOR_FONTS[0].family
}
