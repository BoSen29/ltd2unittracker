import React, {useEffect, useState} from 'react'

import './variables.css'
import './App.css'

import GameBoard from './components/GameBoard'
import WaveHeader from './components/WaveHeader'
import Config from './components/Config'
import Authentication from './utils/auth'
import { getEloImage, isDev, resturcturePlayerData} from './utils/misc'
import { fetchMatches, fetchWave, fetchMatch, fetchCurrentMatch} from './utils/api'



function App() {
  const [gamestate, setGamestate] = useState({})
  const [authStatus, setAuthStatus] = useState(false)
  const [canConfig, setCanConfig] = useState(isDev())
  const [isConfig, setIsConfig] = useState(window.location.hash.startsWith('#/conf'))
  const [matchUUID, setMatchUUID] = useState("")
  const [waveNumber, setWaveNumber] = useState(0)
  const [matchHistory, setMatchHistory] = useState([])
  const [currentMatch, setCurrentMatch] = useState()
  const [liveMatchUUID, setLiveMatchUUID] = useState("")
  const [liveWave, setLiveWave] = useState(1)
  const [playerData, setPlayerData] = useState([])
  const [waveData, setWaveData] = useState({})
  const [streamer, setStreamer] = useState()

  const setWave = async (wave) => {
    let [ match ] = await fetchWave(streamer, currentMatch, wave)
    match = match.waves
    setWaveNumber(wave)
    setWaveData(...match)
  }

  const goToLive = async () => {
    let [ current ] = await fetchCurrentMatch(streamer) 
    let [ match ] = await fetchWave(streamer, liveMatchUUID, liveWave)
    match = match.waves
    setPlayerData(resturcturePlayerData(current))
    setWaveNumber(liveWave)
    setWaveData(...match)
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
    if (isDev()) {
      (async () => {
        setStreamer("bosen")
        let [ current ] = await fetchCurrentMatch("bosen") 
        setPlayerData(resturcturePlayerData(current))
        let liveWave = current.waves.reduce((acc, value) => {
          return (acc = acc > value.wave ? acc: value.wave)
        })
        setLiveWave(liveWave)
        setWaveNumber(liveWave)
        setCurrentMatch(current.uuid)
        setLiveMatchUUID(current.uuid)
        let [ match ] = await fetchWave("bosen", current.uuid, liveWave)
        match = match.waves
        console.log(... match)

        setWaveData(...match)
      })()
      //const mock = require('./v2examplepayload.json')
      //setGamestate(restructureData(mock))
      
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
            setGamestate((d))
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
            <WaveHeader wave={waveNumber} setWave={setWave} finalWave={currentMatch?.endedOn} liveWave={liveWave} goToLive={goToLive}/>
            <div className='game-boards__area'>
              {
                playerData.players && Object.values(playerData.players).map((player) => {
                  return <GameBoard mercsReceived={waveData?.recceived?.filter(m => m.player == player.player)} player={player} units={waveData?.units?.filter(u => u.player == player.player)} wave={waveNumber} key={player.player}/>
                })
              }
            </div>
          </>
      }
    </div>
  )
}

export default App
