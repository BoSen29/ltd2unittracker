import React, {useEffect, useState} from 'react'

import './variables.css'
import './App.css'

import GameBoard from './components/GameBoard'
import WaveHeader from './components/WaveHeader'
import Config from './components/Config'
import Authentication from './utils/auth'

const getEloImage = (elo) => {
  return !elo ? 'Nothing'
    : elo > 2799 ? 'Legend'
    : elo > 2599 ? 'Grandmaster'
    : elo > 2399 ? 'SeniorMaster'
    : elo > 2199 ? 'Master'
    : elo > 1999 ? 'Expert'
    : elo > 1799 ? 'Diamond'
    : elo > 1599 ? 'Platinum'
    : elo > 1399 ? 'Gold'
    : elo > 1199 ? 'Silver'
    : elo > 999 ? 'Bronze'
    : 'Unranked'
}

const isDev = () => {
  return process.env.NODE_ENV === 'development'
}

const getPlayerSendingTo = (player) => {
  return player === 1 ? 5
    : player === 2 ? 6
    : player === 3 ? 7
    : player === 4 ? 8
    : player === 5 ? 2
    : player === 6 ? 1
    : player === 7 ? 4
    : player === 8 ? 3
    : 0
}

const restructureData = (raw) => {
  const gameState = {
    players: {},
    units: {},
    mercsSent: {},
    mercsReceived: {},
    currentWave: 0,
  }

  gameState.currentWave = raw.wave

  for (let playerData of raw.players) {
    const player = {}
    player.player = playerData.player
    player.name = playerData.name
    player.rating = playerData.rating
    player.ratingIcon = `https://cdn.legiontd2.com/icons/Ranks/${getEloImage(playerData.rating)}.png`
    player.image = `https://cdn.legiontd2.com/${playerData.image}`
    player.countryCode = playerData.countryCode
    player.countryName = playerData.countryName
    player.countryFlag = `https://cdn.legiontd2.com/flags/4x3/${playerData.countryCode}.png`
    gameState.players[playerData.player] = player

    gameState.units[playerData.player] = playerData.units.map(unit => ({
      x: unit.x,
      y: unit.y,
      id: unit.displayName,
      icon: `https://cdn.legiontd2.com/${unit.name}`
    }))

    const mercsSent = (playerData.mercenaries || []).map(merc => {
      return {
        name: merc.image.replace('Icons/', '').replace('.png', ''),
        url: `https://cdn.legiontd2.com/${merc.image}`
      }
    })
    gameState.mercsSent[playerData.player] = mercsSent
    gameState.mercsReceived[getPlayerSendingTo(playerData.player)] = mercsSent
  }

  return gameState
}

function App() {
  const [gamestate, setGamestate] = useState({})
  const [authStatus, setAuthStatus] = useState(false)
  const [canConfig, setCanConfig] = useState(isDev())
  const [isConfig, setIsConfig] = useState(window.location.hash.startsWith('#/conf'))

  window.addEventListener('hashchange', (e) => {
    setIsConfig(window.location.hash.startsWith('#/conf'))
  })

  let twitch = window.Twitch ? window.Twitch.ext : null
  const auth = new Authentication()

  if (isDev()) {
    document.body.classList.add('development__background')
  }

  useEffect(() => {
    if (isDev()) {
      const mock = require('./v2examplepayload.json')
      setGamestate(restructureData(mock))
      return
    }
    if (twitch) {
      twitch.onAuthorized((a) => {
        auth.setToken(a.token, a.userId)
        if (auth.isModerator()) {
          setCanConfig(true)
        }
        setAuthStatus(true)

        window.Twitch.ext.configuration.onChanged(() => {
          var broadcaster = window.Twitch.ext.configuration.broadcaster

          if (broadcaster) {
            if (broadcaster.content) {
              var config = {}
              try {
                config = broadcaster.content
              } catch (e) {
                console.log(e)
              }

              console.log(window.Twitch.ext.configuration)
              //do stuff with config
            }
          }
          console.log(broadcaster)
        })

        if (window?.Twitch?.ext?.configuration?.broadcaster?.content) {
          const {csocket} = require('./utils/sock')
          let socket = csocket()
          console.log('Joining the channel', window?.Twitch?.ext?.configuration?.broadcaster?.content)
          socket.emit('join', window?.Twitch?.ext?.configuration?.broadcaster?.content)

          socket.on('gamestate', (d) => {
            setGamestate(restructureData(d))
          })
        } else {
          console.log('No configuration found, awaiting configuration by the streamer.')
        }
      })

      // return the unsubscribe function to let react handle the magic
      return () => {
        //twitch.unlisten('broadcast', () => console.log('Removed listeners'))
        const {csocket} = require('./utils/sock')
        let socket = csocket()
        socket.off('gs')
        socket.off('connect')
      }
    }
  }, [])

  if (!authStatus && !!auth.getUserId()) {
    return <div>
      Loading....
    </div>
  }

  return (
    <div className='app'>
      {
        isConfig && canConfig ?
          <div className='config__container'>
            <Config/>
          </div>
          : <>
            <WaveHeader wave={gamestate.currentWave}/>
            <div className='game-boards__area'>
              {
                gamestate.players && Object.values(gamestate.players).map((player) => {
                  return <GameBoard player={player} units={gamestate.units[player.player]} key={player.player}/>
                })
              }
            </div>
          </>
      }
    </div>
  )
}

export default App
