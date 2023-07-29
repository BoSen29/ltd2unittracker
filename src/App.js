import React, {useEffect, useState} from 'react'

import './variables.css'
import './App.css'

import GameBoard from './components/GameBoard'
import WaveHeader from './components/WaveHeader'
import Config from './components/Config'
import Authentication from './utils/auth'
import { getEloImage, isDev, resturcturePlayerData, is2v2} from './utils/misc'
import {fetchWave, fetchCurrentMatch, fetchMatch} from './utils/api'
import MatchHistoryOverlay from './components/MatchHistoryOverlay'

function App() {
  const [gamestate, setGamestate] = useState({})
  const [authStatus, setAuthStatus] = useState(false)
  const [canConfig, setCanConfig] = useState(isDev())
  const [isConfig, setIsConfig] = useState(window.location.hash.startsWith('#/conf'))
  const [waveNumber, setWaveNumber] = useState(0)
  const [currentMatch, setCurrentMatch] = useState()
  const [liveMatchUUID, setLiveMatchUUID] = useState("")
  const [liveWave, setLiveWave] = useState(1)
  const [playerData, setPlayerData] = useState([])
  const [waveData, setWaveData] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [streamer, setStreamer] = useState()
  const [showEast, setShowEast] = useState(false)
  const [isTailing, setIsTailing] = useState(true)
  const [currentMaxWave, setCurrentMaxWave] = useState(1)
  const [hidden, setHidden] = useState(false)

  const setWave = async (wave) => {
    let [ match ] = await fetchWave(streamer, currentMatch, wave)
    match = match.waves
    setWaveNumber(wave)
    setWaveData(...match)
    setIsTailing(false)
  }

  const newGameHandler = async (payload) => {
    setLiveMatchUUID(payload.match)
    setLiveWave(payload.wave)
    if (isTailing) {
      let [ current ] = await fetchMatch(streamer, payload.match)
      setPlayerData(resturcturePlayerData(current))
      setWaveNumber(payload.wave)
      setCurrentMatch(payload.match)
      let [ match ] = await fetchWave(streamer, payload.match, payload.wave)
      match = match.waves
      setWaveData(...match)
    }
  }

  const newWaveHandler = async(payload) => {
    setLiveMatchUUID(payload.match)
    setLiveWave(payload.wave)
    if (isTailing) {
      setWaveNumber(payload.wave)
      setCurrentMatch(payload.match)
      let [ match ] = await fetchWave(streamer, payload.match, payload.wave)
      match = match.waves
      setWaveData(...match)
    }
  }

  const gameEndedHandler = async(payload) => {
    setLiveMatchUUID(payload.match)
    setLiveWave(payload.wave)
    if (isTailing) {
      setWaveNumber(payload.wave)
      setCurrentMatch(payload.match)
      let [ match ] = await fetchWave(streamer, payload.match, payload.wave)
      match = match.waves
      setWaveData(...match)
    }
  }

  const goToLive = async () => {
    let [ current ] = await fetchCurrentMatch(streamer)
    let [ match ] = await fetchWave(streamer, liveMatchUUID, liveWave)
    match = match?.waves
    setPlayerData(resturcturePlayerData(current))
    setWaveNumber(liveWave)
    setWaveData(...match)
    setIsTailing(true)
  }

  window.addEventListener('hashchange', (e) => {
    setIsConfig(window.location.hash.startsWith('#/conf'))
  })

  let twitch = window.Twitch ? window.Twitch.ext : null
  const auth = new Authentication()

  if (isDev()) {
    //document.body.classList.add('development__background')
  }

  useEffect(() => {
    if (currentMatch) {
      fetchMatch(streamer, currentMatch).then(async (matchData) => {
        setPlayerData(resturcturePlayerData(matchData?.[0]))
        let wave = matchData?.[0].waves?.reduce((acc, value) => {
          return (acc = acc > value.wave ? acc: value.wave)
        })
        if (!!!wave) { return }
        setCurrentMaxWave(wave)
        setWaveNumber(wave)
        let waveData = await fetchWave(streamer, matchData?.[0].uuid, wave)
        if (waveData?.length > 0) {
          setWaveData(waveData[0].waves[0])
        }
      })
    }
  }, [currentMatch])


  useEffect(() => {
    if (isDev()) {

      (async () => {
        setStreamer("bosen")
        try {
          let [ current ] = await fetchCurrentMatch("bosen") 
          if (!!current && current != undefined) {
            setPlayerData(resturcturePlayerData(current))
            let wave = current.waves.reduce((acc, value) => {
              return (acc = acc > value.wave ? acc: value.wave)
            })
            if (!!!wave) { return }
            setLiveWave(wave)
            setWaveNumber(wave)
            setCurrentMatch(current.uuid)
            setLiveMatchUUID(current.uuid)
          }
        }
        catch (e) {
          console.log("Issues fetching data, see error below")
          console.error(e)
        }
        
      })()
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
            }
          }
        })

        if (window?.Twitch?.ext?.configuration?.broadcaster?.content) {
          setStreamer(window?.Twitch?.ext?.configuration?.broadcaster?.content)
        } else {
          console.log('No configuration found, awaiting configuration by the streamer.')
        }
      })

      // return the unsubscribe function to let react handle the magic
      return () => {
        //twitch.unlisten('broadcast', () => console.log('Removed listeners'))
        const {csocket} = require('./utils/sock')
        let socket = csocket()
        socket.off('newWave')
        socket.off('newGame')
        socket.off('gameEnded')
        socket.off('connect')
      }
    }
  }, [])

  useEffect(() => {
    if (streamer?.length > 0) {
      const {csocket} = require('./utils/sock')
      let socket = csocket()
      console.log("Subscribing to " + streamer)
      socket.emit('join', streamer)
      socket.on('newGame', newGameHandler)
      socket.on('newWave', newWaveHandler)
      socket.on('gameEnded', gameEndedHandler)

      return () => {
        //twitch.unlisten('broadcast', () => console.log('Removed listeners'))
        const {csocket} = require('./utils/sock')
        let socket = csocket()
        socket.off('newWave')
        socket.off('newGame')
        socket.off('gameEnded')
        socket.off('connect')
      }
    }
  }, streamer)

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
          : !hidden &&<>
            <MatchHistoryOverlay isOpen={showHistory} setOpen={setShowHistory} player={streamer} setMatchUUID={setCurrentMatch}/>
            <WaveHeader
              wave={waveNumber}
              setWave={setWave}
              finalWave={currentMaxWave}
              liveWave={liveWave}
              goToLive={goToLive}
              westKing={waveData?.leftKingHP || waveData?.leftKingStartHP}
              eastKing={waveData?.rightKingHP || waveData?.rightKingStartHP}
              isTailing={isTailing}
              />
            <div className='game-boards__area'>
              {
                playerData.players && Object.values(playerData.players)
                  .filter(p => {
                    if (is2v2(playerData.players)) { return true}
                    if (showEast) {
                      return p.player > 4
                    }
                    else {
                      return p.player < 5
                    }
                  })
                  .map((player) => {
                  return <GameBoard
                            mercsReceived={waveData?.recceived?.filter(m => m.player === player.player)}
                            player={player}
                            units={waveData?.units?.filter(u => u.player === player.player)}
                            wave={waveNumber}
                            recceived={waveData?.recceivedAmount?.filter(ra => ra.player === player.player)}
                            leaks={waveData?.leaks?.filter(l => l.player === player.player)}
                            key={player.player}/>
                })
              }
            </div>
            {
              !is2v2(playerData.players) && <div className='showEastToggle' onClick={() => setShowEast(e => !e)}>Swap</div>
            }
          </>
      }
      <button className='button__toggle_visibility button_bottomrow' onClick={() => setHidden(d => !d)}>{hidden ? "Show": "Hide"}</button>
    </div>
  )
}

export default App
