import React, { useEffect, useState } from 'react'

import './variables.css'
import './App.css'

import GameBoard from './components/GameBoard'
import WaveHeader from './components/WaveHeader'
import Config from './components/Config'
import Authentication from './utils/auth'
import { isDev, resturcturePlayerData, is2v2, isStandalone } from './utils/misc'
import { fetchWave, fetchCurrentMatch, fetchMatch } from './utils/api'
import MatchHistoryOverlay from './components/MatchHistoryOverlay'
import { useUnits, getToolTip, getValueToolTip } from './stores/units'
import { Tooltip } from 'react-tooltip'
import { io } from 'socket.io-client'

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
  const [hidden, setHidden] = useState(true)
  const [availableWaves, setAvailableWaves] = useState([])
  const [showGuide, setShowGuide] = useState(false)
  const [powerUps, setPowerUps] = useState([])
  const [mmandSpell, setMMandSpell] = useState([])
  const unitDetails = useUnits()
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

  const newWaveHandler = async (payload) => {
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

  const gameEndedHandler = async (payload) => {
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

  useEffect(() => {
    if (!isStandalone()) {
      setShowGuide(true)
      setTimeout(() => {
        setShowGuide(false)
      }, 5000);
    }
    else {
      setHidden(false)
    }
  }, [])

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
          let [current] = await fetchCurrentMatch(streamer)
          let wave = current?.waves?.reduce((acc, value) => {
            return (acc = acc > value.wave ? acc : value.wave)
          })
          if (isNaN(wave)) {
            wave = wave.wave
          }
          setCurrentMatch(current.uuid)
          setWaveNumber(wave)
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
            return (acc = acc > value.wave ? acc : value.wave)
          })
          let avWaves = (matchData?.[0].waves.map(w => w.wave)?.sort((a, b) => { return a > b ? 1 : -1 })?.filter(f => f > 0) || [])
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
    if (currentMatch != undefined && !isNaN(waveNumber)) {
      fetchWave(streamer, currentMatch, waveNumber).then(waveData => {
        if (waveData?.length > 0) {
          setWaveData(waveData[0].waves[0])
          setPowerUps(waveData[0].powerupChoices || [])
          setMMandSpell(waveData[0].players || [])
          setAvailableWaves(i => {
            if (i?.indexOf(waveNumber) != -1) {
              return i
            }
            else {
              if (waveNumber === 1) {
                return [waveNumber]
              }
              if (waveNumber > 0) {
                return [...i, waveNumber]
              }
              else {
                return i
              }
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
      const socket = io("https://ltd2.krettur.no/")

      socket.on("connect", (d) => {
        console.log("Socket connected")
      })
      console.log("Subscribing to " + streamer)
      socket.emit('join', streamer)
      socket.on('newGame', newGameHandler)
      socket.on('newWave', newWaveHandler)
      socket.on('gameEnded', gameEndedHandler)
      setIsTailing(true)
      return () => {
        socket.disconnect()
        console.log("socket disconnected")
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
      <div style={{ color: 'white' }}>

        No streamer specified, please add '/#/%streamername% to your url.'
      </div>
    </>
  }
  return (
    <div className='app'>
      {
        isConfig && canConfig ?
          <div className='config__container'>
            <Config />
          </div>
          : hidden && showGuide ?
            <div className='guideArrow'>
              ↓
            </div>
            : !hidden && <>
              <MatchHistoryOverlay isOpen={showHistory} setOpen={setShowHistory} player={streamer} setMatchUUID={setMatchAndRemoveTailing} />
              <WaveHeader
                wave={waveNumber}
                setWave={setWave}
                liveWave={liveWave}
                goToLive={goToLive}
                westKing={waveData?.leftKingHP === 0 ? 0 : waveData?.leftKingHP || waveData?.leftKingStartHP}
                eastKing={waveData?.rightKingHP === 0 ? 0 : waveData?.rightKingHP || waveData?.rightKingStartHP}
                availableWaves={availableWaves}
              />
              <div className='game-boards__area'>
                {
                  playerData.players && Object.values(playerData.players)
                    .filter(p => {
                      if (is2v2(playerData.players)) { return true }
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
                        key={player.player}
                        MMAndSpell={mmandSpell?.filter(m => m.player === player.player) || []}
                      />
                    })
                }
              </div>
            </>
      }
      {
        !is2v2(playerData.players) && !hidden && <button className={`button_bottomrow button_showEastToggle ${isStandalone() ? 'floor_me' : ''}`} onClick={() => setShowEast(e => !e)}>Swap</button>
      }
      {
        !isTailing && !hidden && <button className={`button__toggle_tailing button_bottomrow ${isStandalone() ? 'floor_me' : ''}`} onClick={() => setIsTailing(e => !e)}>{"To live"}</button>
      }
      <button className={`button__toggle_visibility button_bottomrow ${isStandalone() ? 'floor_me' : ''}`} hidden={isStandalone() || isConfig} onClick={() => {
        setHidden(d => !d)
        setShowGuide(false)
      }}>{hidden ? "Show" : "Hide"}</button>
      {
        !hidden && !!powerUps && powerUps.length > 0 && <div className={`powerup__container ${isStandalone() ? 'floor_me' : ''}`}>
          {
            powerUps.map(p => {
              return <img
                src={`https://cdn.legiontd2.com/${p}`}
                className={`img__powerup`}
                data-tooltip-id='Tooltipper'
                data-unit-image={p}
              />
            })
          }
        </div>
      }
      <Tooltip
        id="Tooltipper"
        render={({ content, activeAnchor }) => (
          getToolTip(unitDetails, activeAnchor?.getAttribute('data-unit-id'), activeAnchor?.getAttribute('data-unit-image'))
        )}
      />
      <Tooltip
        id="ValueTipper"
        render={({ content, activeAnchor }) => (
          getValueToolTip(activeAnchor?.getAttribute('data-fightervalue'), activeAnchor?.getAttribute('data-recommended-value'))
        )}
      />
    </div>
  )
}

export default App
