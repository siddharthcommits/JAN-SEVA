export function getStaticMapUrl(lat: number, lng: number, width = 600, height = 300) {
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY || ''
  if (!apiKey) return ''
  
  // Ola Maps Static Map URL format
  // https://api.olamaps.io/tiles/vector/v1/staticmap?api_key=${api_key}&center=${lat},${lng}&zoom=14&size=${width}x${height}&markers=latlng:${lat},${lng}
  return `https://api.olamaps.io/tiles/vector/v1/staticmap?api_key=${apiKey}&center=${lat},${lng}&zoom=14&size=${width}x${height}&markers=latlng:${lat},${lng}`
}

export default { getStaticMapUrl }
