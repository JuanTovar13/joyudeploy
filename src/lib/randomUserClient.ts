export interface RandomUserPhoto {
  large: string
  medium: string
  thumbnail: string
}

/**
 * Obtiene la foto de perfil de un usuario aleatorio usando el nombre
 * del profesional como seed, garantizando que el mismo nombre
 * siempre devuelva la misma foto.
 */
export async function fetchProfessionalPhoto(
  professionalName: string,
  gender: 'female',
): Promise<RandomUserPhoto> {
  // Normalizar el nombre como seed: sin espacios ni tildes
  const seed = professionalName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()

  const url = `https://randomuser.me/api/?seed=${seed}&gender=${gender}&inc=picture&results=1`

  const response = await fetch(url)
  if (!response.ok) throw new Error(`randomuser.me error: ${response.status}`)

  const data = await response.json()
  return data.results[0].picture as RandomUserPhoto
}

/**
 * Recibe un array de nombres únicos y devuelve un mapa nombre → URL de foto.
 * Las peticiones se hacen en paralelo.
 */
export async function fetchPhotosForProfessionals(
  names: string[],
  gender: 'female' = 'female',
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    names.map(async (name) => {
      try {
        const photo = await fetchProfessionalPhoto(name, gender)
        return [name, photo.large] as const
      } catch {
        return [name, ''] as const
      }
    }),
  )
  return Object.fromEntries(entries)
}
