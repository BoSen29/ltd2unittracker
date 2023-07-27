import React, {useEffect, useState} from 'react'

import './variables.css'
import './App.css'

import GameBoard from './components/GameBoard'
import WaveHeader from './components/WaveHeader'
import Config from './components/Config'
import Authentication from './utils/auth'
import { getEloImage, isDev} from './utils/misc'
import { fetchMatches, fetchWave} from './utils/api'


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

    gameState.mercsReceived[playerData.player] = (playerData.mercenaries || []).map(merc => {
      return {
        name: merc.image.replace('Icons/', '').replace('.png', ''),
        url: `https://cdn.legiontd2.com/${merc.image}`
      }
    })
  }

  return gameState
}

function App() {
  const [gamestate, setGamestate] = useState({})
  const [authStatus, setAuthStatus] = useState(false)
  const [canConfig, setCanConfig] = useState(isDev())
  const [isConfig, setIsConfig] = useState(window.location.hash.startsWith('#/conf'))
  const [matchUUID, setMatchUUID] = useState("")
  const [waveNumber, setWaveNumber] = useState(0)
  const [matchHistory, setMatcheHistory] = useState([])

  const setWave = (wave) => {
    setGamestate({...gamestate, currentWave: wave})
  }

  window.addEventListener('hashchange', (e) => {
    setIsConfig(window.location.hash.startsWith('#/conf'))
  })

  let twitch = window.Twitch ? window.Twitch.ext : null
  const auth = new Authentication()

  if (isDev()) {
    document.body.classList.add('development__background')
  }


  useEffect(() => {
    (async () => {
      setMatcheHistory(async (d) => await fetchMatches("bosen"))
    })() 

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
            <WaveHeader wave={gamestate.currentWave} setWave={setWave} finalWave={5} liveWave={5}/>
            <button onClick={() => setDrawerState(true)}>CLICK ME</button>
            <div className='game-boards__area'>
              {
                gamestate.players && Object.values(gamestate.players).map((player) => {
                  return <GameBoard mercsReceived={gamestate.mercsReceived[player.player]} player={player} units={gamestate.units[player.player]} wave={gamestate.currentWave} key={player.player}/>
                })
              }
            </div>
          </>
      }
    </div>
  )
}

export default App
