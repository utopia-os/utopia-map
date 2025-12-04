/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
export const getImageDimensions = (
  file: File,
): Promise<{
  width: number
  height: number
}> =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader()

      fileReader.onload = () => {
        try {
          const img = new Image()

          img.onload = () => {
            resolve({ width: img.width, height: img.height })
          }

          img.src = fileReader.result as string // is the data URL because called with readAsDataURL
        } catch (error) {
          reject(error)
          throw new Error('Error loading image')
        }
      }

      fileReader.readAsDataURL(file)
    } catch (error) {
      reject(error)
      throw new Error('Error reading image file')
    }
  })
