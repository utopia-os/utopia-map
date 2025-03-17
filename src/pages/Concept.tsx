/* eslint-disable react/no-unescaped-entities */
import { CardPage } from 'utopia-ui'

export default function Concept() {
  return (
    <CardPage title='Concept'>
      Utopia is a cooperative Real Life Manifestation Game. While playing, we connect with
      ourselves, each other and our dreams to manifest them together.<br></br>
      <br></br>
      <div className='collapse collapse-arrow bg-base-200 mb-2'>
        <input type='radio' name='my-accordion-2' />
        <div className='collapse-title text-xl font-medium'>Real Life Manifestation Games </div>
        <div className='collapse-content'>
          <ul className='list-disc list-inside pl-4'>
            <li>
              Like a role-playing game, you can create your own profile, but here you can map, share
              and train real skills.
            </li>
            <li>
              Further, real resources are made visible and available, managed and used, similar to a
              strategy game.
            </li>
            <li>
              Project management tasks can be mapped as quests, levels, missions and problems become
              challenges.
            </li>
            <li>The storytelling is based on the real conditions and challenges on our planet.</li>
            <li>
              The goal of the game is to create win-win-win situations. Win for you, win for us, win
              for the world.
            </li>
          </ul>
        </div>
      </div>
      <div className='collapse collapse-arrow bg-base-200 mb-2'>
        <input type='radio' name='my-accordion-2' />
        <div className='collapse-title text-xl font-medium'>Elements</div>
        <div className='collapse-content'>
          <div className='flex flex-row flex-wrap'>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> The App</h3>
              The app provides an interactive geographical map as a playing field. It also allows
              you to create and view player profiles. The marketplace shows offers and needs.{' '}
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> Print Material</h3>
              To complement offline play, there are flyers, stickers, signs and workbooks that
              invite players to play. Players receive or print ID cards with QR codes that are used
              for networking (more on this later).
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> Gatherings</h3>
              Coming together at workshops, festivals and local meetings to connect, build
              structures and to engage new players.{' '}
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> Permanent Structures</h3>
              When we play, we create tangible structures like places and infrastructure. And also
              intangibles like networks of relationships, stories, information ...
            </div>
          </div>
        </div>
      </div>
      <div className='collapse collapse-arrow bg-base-200 mb-2'>
        <input type='radio' name='my-accordion-2' />
        <div className='collapse-title text-xl font-medium'>Goals </div>
        <div className='collapse-content'>
          <ol className='list-decimal list-inside pl-4'>
            <li>To build a decentralised network</li>
            <li>Free development of our collective and individual potential</li>
            <li>Start co-creation and build collective structures</li>
          </ol>
        </div>
      </div>
      <div className='collapse collapse-arrow bg-base-200 mb-2'>
        <input type='radio' name='my-accordion-2' />
        <div className='collapse-title text-xl font-medium'>Gameplay </div>
        <div className='collapse-content'>
          Through playful elements and gamification, the player is motivated and guided through
          quests and levels.
          <h3 className='text-base my-3 font-medium'> Player Profiles</h3>
          The player examines himself and his abilities as well as deeper desires and visions to
          define his character or player profile. The focus is on the following questions:
          <ul className='list-disc list-inside pl-4 pt-4'>
            <li>How and in what kind of world do I want to live?</li>
            <li>Who am I and what are my special abilities or my special task in this life?</li>
            <li>
              What do I have to give? What can and do I want to share with others and the world?
            </li>
            <li>
              What do I still need to come fully into my power? How can others support me in this?
            </li>
          </ul>
          <h3 className='text-base my-3 font-medium'> Resources</h3>
          The player explores and defines his/her offers and needs, shares his/her resources and
          uses those of the network. E.g. tools, machines, electrical appliances, vehicles, food and
          drink, places to sleep, rides, books, access to the internet, individual skills and help
          in everyday life
          <h3 className='text-base my-3 font-medium'> Realising Projects</h3>
          The player joins projects and starts his own. The game offers support in project
          management or crowdfunding. In this way, structures, events, permanent places,
          infrastructure and everything we need to meet our human needs in harmony with Mother Earth
          can be created.
          <h3 className='text-base my-3 font-medium'> Making Change visible</h3>
          The player is motivated to map and document the newly emerging world by ...
          <ul className='list-disc list-inside pl-4 pt-4'>
            <li>adding places, events etc. to the map</li>

            <li>documenting projects with text, images, audio and video</li>

            <li>telling stories of change</li>
          </ul>
        </div>
      </div>
      <div className='collapse collapse-arrow bg-base-200 mb-2'>
        <input type='radio' name='my-accordion-2' />
        <div className='collapse-title text-xl font-medium'>Web of Trust </div>
        <div className='collapse-content'>
          <div className='flex flex-row flex-wrap'>
            While we connect with other people in real life and build our personal network, we are
            simultaneously exchanging cryptographic keys and building a "Web of Trust".{' '}
            <div className='basis-full'>
              <div className='divider divider-vertical'></div>
            </div>
            <h3 className='text-base basis-full my-3 font-medium'> Decentralised IDs</h3>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <img className='float-right h-28 px-4 pb-4' src='/public-private-key.svg'></img>

              <p>
                When we create our profile, a key pair consisting of a private key and a public key
                is generated at the same time.
              </p>
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <p className='basis-full pb-4'>
                We share the public key with our friends and they can use it to encrypt data for us.
                We keep the private key secret. It is needed to decrypt data that has been encrypted
                for us on our device.
              </p>
            </div>
            <div className='basis-full'>
              <div className='divider divider-vertical'></div>
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> Key Exchange</h3>
              <img className='float-left h-32 px-4' src='/qr-scan.svg'></img>
              When we meet people in real life, we can exchange our public keys by scanning each
              other's QR codes or on paper.{' '}
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> Private data sharing</h3>
              <img className='float-right h-32 px-4' src='/web-of-trust.svg'></img>
              Within our network, we can then share our profiles, offers, needs, projects, locations
              and events end-to-end encrypted.
            </div>
          </div>
        </div>
      </div>
      <div className='collapse collapse-arrow bg-base-200 mb-2'>
        <input type='radio' name='my-accordion-2' />
        <h2 className='collapse-title text-xl font-medium'>Principles </h2>
        <div className='collapse-content'>
          <div className='flex flex-row flex-wrap'>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> Everything is just a game</h3>
              Everything happens voluntarily, out of ourselves in the flow. Everyone is invited to
              join in at any time.
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> No Money</h3>
              Since the fun stops with money, we don't pay each other money when we play.
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> Decentralised Structures</h3>
              All structures we create are decentralised and free of hierarchies. The same rules
              apply to everyone.
            </div>
            <div className='basis-full md:basis-1/2 pr-4 pb-4'>
              <h3 className='text-base my-3 font-medium'> Real Life</h3>
              Real change happens in real life. We only use the internet where it directly helps to
              organise real encounters.{' '}
            </div>
          </div>
        </div>
      </div>
    </CardPage>
  )
}
