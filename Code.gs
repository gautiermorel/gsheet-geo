const OPENSTREETMAP_API = 'https://nominatim.openstreetmap.org/search?format=json&'
const GOOGLE_MAPS_DIR = 'https://www.google.com/maps/dir/'
const REF_COLUMN_A = 1


function getGeolocation (input) {
  if (!input) return {}

  try {
    const query = encodeURI(input)
    // eslint-disable-next-line no-undef
    const response = UrlFetchApp.fetch(`${OPENSTREETMAP_API}&q=${query}`, { 'method': 'get' })
    const { lat, lon, display_name: displayName } = JSON.parse(response)?.[0] || {}

    return { lat, lon, displayName }
  } catch (error) {
    console.log('[ERROR] Error while getting geo info, error:', error)

    return {}
  }
}

function onEdit (e) {
  if (!e || !e.source) return

  const sheet = e.source.getActiveSheet()
  const editedRange = e.range
  const editedRow = editedRange.getRow()
  const editedColumn = editedRange.getColumn()

  for (let i = 1; i <= editedRange.getNumRows(); i++) {
    for (let j = 1; j <= editedRange.getNumColumns(); j++) {
      const cell = sheet.getRange(editedRow + i - 1, editedColumn + j - 1)

      if (cell.getColumn() === REF_COLUMN_A) {
        for (const column of [1, 2, 3, 4]) cell.offset(0, column).setValue('Searching...')

        const { lat, lon, address = {} } = getGeolocation(cell.getValue())
        const { house_number = null, road = null, postcode = null, city = null, village = null, town = null, country = null } = address

        cell.offset(0, 1).setValue(lat ? `${lat},${lon}` : '-')
        cell.offset(0, 2).setValue(lat ? `${GOOGLE_MAPS_DIR}${lat},${lon}` : '-')
        cell.offset(0, 3).setValue(road ? `${house_number || ''} ${road || ''}, ${postcode || ''} ${city || village || town || ''} (${country || ''})` : '-')
        cell.offset(0, 4).setValue(`${OPENSTREETMAP_API}&q=${encodeURI(cell.getValue())}`)

        Utilities.sleep(1200)
      }
    }
  }
}
