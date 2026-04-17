export const loadingPhrases = [
  'Las palabras esperan pacientemente...',
  'Preparando el silencio para ti...',
  'Tu refugio está abriendo sus puertas...',
  'Encendiendo las luciérnagas...',
  'Cada historia empieza con una hoja en blanco...',
  'El papel está listo para escucharte...',
  'Respiremos antes de empezar...',
  'Aquí nadie te juzga. Solo escribe.',
  'Tu espacio te ha echado de menos...',
  'La oscuridad a veces es el mejor lugar para escribir...',
]

export const emptyLibraryPhrases = [
  'Aún no hay nada escrito, y eso está bien.',
  'Todo gran libro empezó con una página en blanco.',
  'Tu primera historia está esperando que la invites.',
  'El silencio también es un lugar para empezar.',
]

export const editorIdlePhrases = [
  'Escribe lo que sientes. Puedes editarlo después.',
  'No hay palabras equivocadas aquí.',
  'Un párrafo. Luego otro. Así empieza todo.',
  'Este espacio es tuyo. Completamente tuyo.',
]

export const getRandomPhrase = (phrases: string[]): string =>
  phrases[Math.floor(Math.random() * phrases.length)]
