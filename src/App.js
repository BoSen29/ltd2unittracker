import React, {useEffect, useState} from 'react'

import './variables.css'
import './App.css'

import $ from "jquery";
import GameBoard from './components/GameBoard'
import WaveHeader from './components/WaveHeader'
import Config from './components/Config'
import Authentication from './utils/auth'
import { getEloImage, isDev, resturcturePlayerData, is2v2, isStandalone} from './utils/misc'
import {fetchWave, fetchCurrentMatch, fetchMatch} from './utils/api'
import MatchHistoryOverlay from './components/MatchHistoryOverlay'
import UnitOverlayConfig from './components/UnitOverlayConfig'
import { SelectProvider } from '@mui/base';
import { formControlClasses } from '@mui/material';

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

  const [showOverlay, setShowOverlay] = useState(false)

  

  const [overlayConfigValues, setOverlayConfigValues] = React.useState({
    AttackDefense:false,
    Cost:false,
  });

//   function sleep(ms) 
//   {
//     var e = new Date().getTime() + (1);
//     while (new Date().getTime() <= e) {}
//   }
// //  sleep(500); 

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
  },[])

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
    if (currentMatch != undefined && !isNaN(waveNumber)) {
      fetchWave(streamer, currentMatch, waveNumber).then(waveData => {
        if (waveData?.length > 0) {
          console.log("pre- wavedata set")
          setWaveData(waveData[0].waves[0])
          console.log("post- wavedata set")
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
        setStreamer('gerksterr')    
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


// let m;
//   useEffect(() =>{
//     (async () => {
      
//   try {
//   // let unitsJson = await (await fetch("http://localhost:3001/json/units/u")).json();
//   //     for(let i = 0; i <unitsJson.length; i++){
//   //       let json = unitsJson[i];
//   //       unitId_UnitDesc.set(json.unitId, json);
//   //     }
//   let resp = await fetch("https://ltd2.krettur.no/units/harpy_unit_id.json");
//   let text = await resp.text();
//  let unitsJson = await (await fetch("ltd2.krettur.no/units/harpy_unit_id.json")).json();
//       for(let i = 0; i <unitsJson.length; i++){
//         let json = unitsJson[i];
//         unitId_UnitDesc.set(json.unitId, json);
//       }
//     } catch(e){
//       e=e;
//     }

//     let req =  await fetch("ltd2.krettur.no/units/harpy_unit_id.json")
//     if (req.status == 200) {
//       try {
//         let { matches } = await req.json();
//         matches=matches;
//         m = matches;
//       } catch(e){
//         e=e;
//       }
//         //return matches
//     }
//     else {
//         //return []
//     }
//   })();
//   });
// m = m;

// const [auras, setAuras] = useState(new Set(    
//   [
//     "aerial_command",
//     "cannibalism",
//     "leech",
//     "overcharge",
//     "energize",
// "council",
// "resonance",
// "amplify_magic",
//   ]));
// const [auraIdToDisplayName, setAuraIdToDisplayName] = useState(new Map([
//   ["aerial_command", "AerialCommand"],
//   ["cannibalism", "Cannibalism"],
//   ["leech", "Leech"],
//   ["overcharge", "Overcharge"],
//   ["energize", "Energize"],
//   ["council", "Council"],
//   ["resonance", "Resonance"],
//   ["amplify_magic", "AmplifyMagic"],
// ]));
// const [unitIdToUnitDesc, setUnitIdToUnitDesc] = useState(new Map());
const [auras, setAuras] = useState(new Set(    
  [
    "aerial_command_ability_id",
    "cannibalism_ability_id",
    "leech_ability_id",
    "overcharge_ability_id",
    "energize_ability_id",
"council_ability_id",
"resonance_ability_id",
"amplify_magic_ability_id",
  ]));
const [auraIdToDisplayName, setAuraIdToDisplayName] = useState(new Map([
  ["aerial_command_ability_id", "AerialCommand"],
  ["cannibalism_ability_id", "Cannibalism"],
  ["leech_ability_id", "Leech"],
  ["overcharge_ability_id", "Overcharge"],
  ["energize_ability_id", "Energize"],
  ["council_ability_id", "Council"],
  ["resonance_ability_id", "Resonance"],
  ["amplify_magic_ability_id", "AmplifyMagic"],
]));
const [unitIdToUnitDesc, setUnitIdToUnitDesc] = useState(new Map());


// useEffect(() => {
//   auras = new Set(    
//     [
//       "aerial_command_ability_id",
//       "cannibalism_ability_id",
//       "leech_ability_id",
//       "overcharge_ability_id",
//       "energize_ability_id",
//   "council_ability_id",
// "resonance_ability_id",
// "amplify_magic_ability_id",
//     ]);
//     auraIdToDisplayName = new Map([
//       ["aerial_command_ability_id", "AerialCommand"],
//       ["cannibalism_ability_id", "Cannibalism"],
//       ["leech_ability_id", "Leech"],
//       ["overcharge_ability_id", "Overcharge"],
//       ["energize_ability_id", "Energize"],
//       ["council_ability_id", "Council"],
//       ["resonance_ability_id", "Resonance"],
//       ["amplify_magic_ability_id", "AmplifyMagic"],
//     ]);

//     setAuras(auras); setAuraIdToDisplayName(auraIdToDisplayName);
// },[]);
const [overlayData, setOverlayData] = useState( {  
  unitIdToUnitDesc: unitIdToUnitDesc,
  auras: auras,
  auraIdToDisplayName: auraIdToDisplayName,
 });
  console.log("auras.size: " + auras.size);
//  console.log("auraIdToDisplayName.size: " + auraIdToDisplayName.size);

useEffect(() =>  {
//   let unitsJson = require("./units.json");
//   for(let i = 0; i <unitsJson.length; i++){
//     let json = unitsJson[i];
//     unitIdToUnitDesc.set(json.unitId, json);
//   }
//  //setUnitIdToUnitDesc(unitIdToUnitDesc);
//   setOverlayData({
//     unitIdToUnitDesc: unitIdToUnitDesc,
//     auras: auras,
//     auraIdToDisplayName: auraIdToDisplayName,
//   });
// return;

(async () => {
  try {
  let unitsJson = await (await fetch(`http://localhost:3001/units`)).json();
  for(let i = 0; i <unitsJson.length; i++){
    let json = unitsJson[i];    
    json.unitId += "_unit_id";
    for(let i_auras = 0; i_auras < json.abilities.length; i_auras++)
      json.abilities[i_auras] += "_ability_id";
    json.ingameName = json.iconPath.split("Icons/")[1].split(".png")[0];
    unitIdToUnitDesc.set(json.unitId, json);

  }
 //setUnitIdToUnitDesc(unitIdToUnitDesc);
  setOverlayData({
    unitIdToUnitDesc: unitIdToUnitDesc,
    auras: overlayData.auras,
    auraIdToDisplayName: overlayData.auraIdToDisplayName,
  });
} catch(e){
  e= e;
  console.log(e);
}
})();
return;

  (async () => {
    try{
    if(waveData == null){
     return;
    }
    
    console.log("391");
  for(let unit of waveData?.units){
    console.log("beenhit");
    if(!unitIdToUnitDesc.has(unit.displayName)){

      unitIdToUnitDesc.set(unit.displayName, await (await fetch(`https://ltd2.krettur.no/units/${unit.displayName}.json`)).json());
    }
  }
} catch(e){
  e=e;
}
  //setUnitIdToUnitDesc(unitIdToUnitDesc);
  console.log("auras.size: " + auras.size);
  console.log("auraIdToDisplayName.size: " + auraIdToDisplayName.size);
  setOverlayData({
    unitIdToUnitDesc: unitIdToUnitDesc,
    auras: auras,
    auraIdToDisplayName: auraIdToDisplayName,
  });
})();

  }, waveData.units);
useEffect(() =>{
  console.log(waveData?.units?.length);
}, waveData.units);


  if (!authStatus && !!auth.getUserId()) {
    return <div>
      Loading....
    </div>
  }

  if (false && isStandalone() && window.location.hash === '') {
    return <>
      <div style={{color: 'white'}}>

        No streamer specified, please add '/#/%streamername% to your url.'
      </div>
    </>
  }
  $.ajaxSetup({
    async: false
});


// let q = $.getJSON("C:/Users/User/Documents/GitHub/ltd2unittracker/src/index.js");
// let jsonn = q.responseText;
// let w = jsonn;
  return (
    <div className='app'>
      {
        isConfig && canConfig ?
          <div className='config__container'>
            <Config/>
          </div>
          : hidden && showGuide?
            <div className='guideArrow'>
              ↓
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
                (() => {
                if(waveData?.units != undefined){
                  return;
                }  
                })()
              }
              {
                playerData.players && Object.values(playerData.players)
                  .filter(p => {
                    if(waveData?.units != null){
                      let k = 1;
                    }
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
                            key={player.player}
                            overlayConfigValues={overlayConfigValues}
                            overlayData = {overlayData}
                            />
                })
              }
            </div>
          </>
      }
      {
        !is2v2(playerData.players) && <button className='button_bottomrow button_showEastToggle' onClick={() => setShowEast(e => !e)}>Swap</button>
      }
      {
        !isTailing && !hidden && <button className='button__toggle_tailing button_bottomrow' onClick={() => setIsTailing(e => !e)}>{"To live"}</button>
      }
      <button className='button__toggle_visibility button_bottomrow' hidden={isStandalone() || isConfig} onClick={() => {
        setHidden(d => !d)
        setShowGuide(false)
      }}>{hidden ? "Show": "Hide"}</button>
      <button className='button__toggle_visibility button_bottomrow' onClick={() => {
        setShowOverlay(!showOverlay)
      }}>Toggle Overlay</button>      
      <UnitOverlayConfig overlayConfigValues={overlayConfigValues} setOverlayConfigValues={setOverlayConfigValues} className="bottomrow"></UnitOverlayConfig>
      <div className="button__toggle_visibility button_bottomrow">FFFF</div>

    </div>
  )
}

export default App
