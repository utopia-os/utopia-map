/* eslint-disable @typescript-eslint/use-unknown-in-catch-callback-variable */
import { toast } from 'react-toastify'

import ChevronSVG from '#assets/chevron.svg'
import ClipboardSVG from '#assets/share/clipboard.svg'

import SocialShareButton from './SocialShareButton'

const SocialShareBar = ({
  url,
  title,
  platforms = ['facebook', 'twitter', 'linkedin', 'xing', 'email'],
}: {
  url: string
  title: string
  platforms?: string[]
}) => {
  const copyLink = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('link copied to clipboard')
        return null
      })
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      .catch((error: never) => {
        toast.error('Fehler beim Kopieren des Links: ', error)
      })
  }
  return (
    <div className='tw:flex tw:place-content-end tw:justify-end tw:space-x-2 tw:grow tw:min-w-fit tw:pl-2'>
      {platforms.map((platform) => (
        <SocialShareButton key={platform} platform={platform} url={url} title={title} />
      ))}
      {platforms.includes('email') && (
        <a
          href={`mailto:?subject=${title}&body=${url}`}
          target='_blank'
          rel='noopener noreferrer'
          className='tw:w-8 tw:h-8 tw:mt-2 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-white tw:hover:cursor-pointer'
          style={{
            color: 'white',
            backgroundColor: '#444',
          }}
          onClick={() => {
            copyLink()
          }}
          title='share link via email'
        >
          <img src={ChevronSVG} alt='\/' className='tw:h-4 tw:w-4' />
        </a>
      )}
      {platforms.includes('clipboard') && (
        <div
          rel='noopener noreferrer'
          className='tw:w-8 tw:h-8 tw:mt-2 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-white tw:hover:cursor-pointer'
          style={{
            color: 'white',
            backgroundColor: '#888',
          }}
          onClick={() => {
            copyLink()
          }}
          title='copy Link'
        >
          <img src={ClipboardSVG} className='tw:w-5' />
        </div>
      )}
    </div>
  )
}

export default SocialShareBar
