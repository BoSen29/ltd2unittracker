import React, {useEffect, useState} from 'react'

import './variables.css'
import './App.css'

import GameBoard from './components/GameBoard'
import WaveHeader from './components/WaveHeader'
import Config from './components/Config'
import Authentication from './utils/auth'
import { getEloImage, isDev, resturcturePlayerData, is2v2, isStandalone} from './utils/misc'
import {fetchWave, fetchCurrentMatch, fetchMatch} from './utils/api'
import MatchHistoryOverlay from './components/MatchHistoryOverlay'

function App() {
  const [authStatus, setAuthStatus] = useState(false)
  const [canConfig, setCanConfig] = useState(isDev())
  const [isConfig, setIsConfig] = useState(window.location.hash.startsWith('#/conf'))
  const [waveNumber, setWaveNumber] = useState(0)
  const [currentMatch, setCurrentMatch] = useState()
  const [liveWave, setLiveWave] = useState(1)
  const [playerData, setPlayerData] = useState([])
  const [waveData, setWaveData] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [streamer, setStreamer] = useState()
  const [showEast, setShowEast] = useState(false)
  const [isTailing, setIsTailing] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [availableWaves, setAvailableWaves] = useState([])

  const setWave = async (wave) => {
    try {
      setIsTailing(false)
      setWaveNumber(wave)
    }
    catch {
      console.log("Error fetching data")
    }
  }

  const setMatchAndRemoveTailing = (matchUUID) => {
    setIsTailing(false)
    setCurrentMatch(matchUUID)
  }

  const newGameHandler = async (payload) => {
    setIsTailing(e => {
      if (e) {
        setCurrentMatch(payload.match)
      }
      return e
    })
  }

  const newWaveHandler = async(payload) => {
    setIsTailing(e => {
      if (e) {
        setCurrentMatch(m => {
          if (m == payload.match) {
            setWaveNumber(payload.wave)
          }
          else {
            return payload.match
          }
          return m
        })
      }
      return e
    })
  }

  const gameEndedHandler = async(payload) => {
    setIsTailing(e => {
      if (e) {
        setCurrentMatch(m => {
          if (m == payload.match) {
            setWaveNumber(payload.wave)
          }
          else {
            return payload.match
          }
          return m
        })
      }
      return e
    })
  }

  const goToLive = async () => {
    setIsTailing(true)
  }

  window.addEventListener('hashchange', (e) => {
    setIsConfig(window.location.hash.startsWith('#/conf'))
    if (!window.location.hash.startsWith('#/conf') && isStandalone()) {
      setStreamer(window.location.hash.split('#/')[1])  
    }
  })

  let twitch = window.Twitch ? window.Twitch.ext : null
  const auth = new Authentication()

  useEffect(() => {
    if (isTailing && streamer?.length > 0) {
      (async () => {
        try {
          let [ current ] = await fetchCurrentMatch(streamer)
          let wave = current?.waves?.reduce((acc, value) => {
            return (acc = acc > value.wave ? acc: value.wave)
          })
          if (isNaN(wave)) {
            wave = wave.wave
          }
          setCurrentMatch(current.uuid)
          setWave(wave)
        }
        catch (ex) {
          console.log("Issues fetching data from the API, please reload")
          console.log(ex)
        }

      })()
      console.log("Tailing enabled")
    }
    else {
      console.log("Tailing disabled")
    }
  }, [isTailing, streamer])

  useEffect(() => {
    if (currentMatch != undefined) {
      fetchMatch(streamer, currentMatch).then(async (matchData) => {
        try {
          setPlayerData(resturcturePlayerData(matchData?.[0]))
          let wave = matchData?.[0].waves?.reduce((acc, value) => {
            return (acc = acc > value.wave ? acc: value.wave)
          })
          let avWaves = (matchData?.[0].waves.map(w => w.wave)?.sort((a,b) => {return a > b ? 1: -1})?.filter(f => f > 0) || [])
          setAvailableWaves(avWaves)
          if (!!!wave) { return }
          if (isNaN(wave)) {
            wave = wave.wave
          }
          setWaveNumber(e => wave)
          
        }
        catch {
          console.log("Issues fetching match data")
        }
      })
    }
  }, [currentMatch])

  useEffect(() => {
    if (currentMatch != undefined) {
      fetchWave(streamer, currentMatch, waveNumber).then(waveData => {
        if (waveData?.length > 0) {
          setWaveData(waveData[0].waves[0])
          setAvailableWaves(i => {
            if (i.indexOf(waveNumber) != -1) {
              return i
            }
            else {
              return [...i, waveNumber]
            }
          })
        }
      })
    }
    
  }, [waveNumber, currentMatch])


  useEffect(() => {
    if (isDev()) {
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
          console.log("Found configuration, connecting to " + window?.Twitch?.ext?.configuration?.broadcaster?.content)
        } else {    
          console.log('No configuration found, awaiting configuration by the streamer.')
        }
      })

      if (isStandalone()) {
        setStreamer(window.location.hash.split('#/')[1])    
        document.body.classList.add('development__background')
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

      setIsTailing(true)

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
  }, [streamer])

  if (!authStatus && !!auth.getUserId()) {
    return <div>
      Loading....
    </div>
  }

  if (isStandalone() && window.location.hash === '') {
    return <>
      <div style={{color: 'white'}}>

        No streamer specified, please add '/#/%streamername% to your url.'
      </div>
    </>
  }
  return (
    <div className='app'>
      {
        isConfig && canConfig ?
          <div className='config__container'>
            <Config/>
          </div>
          : !hidden &&<>
            <MatchHistoryOverlay isOpen={showHistory} setOpen={setShowHistory} player={streamer} setMatchUUID={setMatchAndRemoveTailing}/>
            <WaveHeader
              wave={waveNumber}
              setWave={setWave}
              liveWave={liveWave}
              goToLive={goToLive}
              westKing={waveData?.leftKingHP === 0? 0: waveData?.leftKingHP || waveData?.leftKingStartHP}
              eastKing={waveData?.rightKingHP === 0? 0: waveData?.rightKingHP || waveData?.rightKingStartHP}
              availableWaves={availableWaves}
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
                            mercsReceived={waveData?.recceived?.filter(m => m.player === player.player) || []}
                            player={player}
                            units={waveData?.units?.filter(u => u.player === player.player) || []}
                            wave={waveNumber || 0}
                            recceived={waveData?.recceivedAmount?.filter(ra => ra.player === player.player) || []}
                            leaks={waveData?.leaks?.filter(l => l.player === player.player) || []}
                            postGameStats={waveData?.postGameStats?.filter(pgs => pgs.player === player.player) || []}
                            key={player.player}/>
                })
              }
            </div>
          </>
      }
      {
        !is2v2(playerData.players) && <button className='button_bottomrow button_showEastToggle' onClick={() => setShowEast(e => !e)}>Swap</button>
      }
      {
        !isTailing && <button className='button__toggle_tailing button_bottomrow' onClick={() => setIsTailing(e => !e)}>{"To live"}</button>
      }
      <button className='button__toggle_visibility button_bottomrow' hidden={isStandalone() && !isConfig} onClick={() => setHidden(d => !d)}>{hidden ? "Show": "Hide"}</button>
    </div>
  )
}

export default App
