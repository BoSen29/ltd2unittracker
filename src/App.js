import './App.css';
import React, { useEffect, useState } from 'react';
import Authentication from './utils/auth'

const yBuildings = [77.50, 91.50]
// bounds of gameboard for the players in a 2v2
const players = [
  {
    number: 1,
    xmin: 8,
    xmax: 17,
  },
  {
    number: 2,
    xmin: 28,
    xmax: 37
  },
  {
    number: 5,
    xmin: 51,
    xmax: 60
  },
  {
    number: 6,
    xmin: 71,
    xmax: 80
  }
]



const getWaveImage = (wave) => {
  return !wave ? "Nothing":
    wave > 20? "LegionLord":
    wave > 19? "Maccabeus":
    wave > 18? "DireToad":
    wave > 17? "WaleChief":
    wave > 16? "MetalDragon":
    wave > 15? "Cardinal":
    wave > 14? "Quadrapus":
    wave > 13? "KillerSlug":
    wave > 12? "DrillGolem":
    wave > 11? "Mantis":
    wave > 10? "QuillShooter":
    wave > 9 ? "Granddaddy":
    wave > 8 ? "Carapace":
    wave > 7 ? "Kobra":
    wave > 6 ? "Sludge":
    wave > 5 ? "Rocko":
    wave > 4 ? "Scorpion":
    wave > 3 ? "FlyingChicken":
    wave > 2 ? "Hopper":
    wave > 1 ? "Wale":
    "Crab"
}

const getEloImage = (elo) => {
  return !elo ? "Nothing":
    elo > 2799 ? "Legend":
    elo > 2599 ? "Grandmaster":
    elo > 2399 ? "SeniorMaster":
    elo > 2199 ? "Master":
    elo > 1999 ? "Expert":
    elo > 1799 ? "Diamond":
    elo > 1599 ? "Platinum":
    elo > 1399 ? "Gold":
    elo > 1199 ? "Silver":
    elo > 999 ? "Bronze":
    "Unranked"
}

const isConfig = () => {
  return window.location.hash.startsWith('#/conf')
} 

const getGameBoards = (gamestate) => {
  let gameBoards = []
  let p = [1,2,5,6]
  let key = 0;
  p.forEach(i => {
    let [ currentPlayer ] = gamestate?.players?.filter(p => p?.player?.toString() === i.toString()) || []

    let rank = getEloImage(currentPlayer?.rating)
    gameBoards.push(<div className='game-board__container'>
      <div className='game-board__header'>
        <img src={`https://cdn.legiontd2.com/${currentPlayer?.image}`} title='Avatar' className='header__icon'>

        </img>

        <div className={'player-info__container'}>
          <img src={`https://cdn.legiontd2.com/flags/4x3/${currentPlayer?.countryCode}.png`} title={currentPlayer?.countryName} className='country__icon'/>
          <div className={'player' + i}>
            {
              currentPlayer?.name || "Player " + i
            }
          </div>
        </div>

        <img src={`https://cdn.legiontd2.com/icons/Ranks/${rank}.png`} title={rank} className='header__icon'/>

      </div>
      <div className='game-board'>
      {
        gamestate?.units?.filter(u => u.player == i)?.map(u => {
          key++
          const uri = `https://cdn.legiontd2.com/icons/${u.name}.png`
          const pconfig = players.filter(p => p.number == i)[0]
          const left = (u.x - pconfig.xmin - 0.5) === 0 ? 0 : 100 / (pconfig.xmax - pconfig.xmin) *(u.x - pconfig.xmin - 0.5)
          const bottom = (u.y - yBuildings[0] - 0.5) === 0 ? 0 : 100 / (yBuildings[1] - yBuildings[0]) * (u.y - yBuildings[0] - 0.5)
          return <img src={uri} title={u.name} key={key + "randomkey"} className='unit__icon' style={
            {
              left: left + "%",
              bottom: bottom + "%"
            }
          }></img>
        })
      }
    </div>
      <div className={'player__color-marker player' + i + '__background'}/>
    </div>)
  })
  return gameBoards
}

function App() {
  const [gamestate, setGamestate] = useState({})
  const [config, setConfig] = useState("")
  const [authStatus, setAuthStatus] = useState(false)
  const [canConfig, setCanConfig] = useState(false)
  
  let twitch = window.Twitch ? window.Twitch.ext : null
  const auth = new Authentication()

  useEffect(() => {
      if (twitch) {
        twitch.onAuthorized((a) => {
          auth.setToken(a.token, a.userId)
          if (auth.isModerator() ) {setCanConfig(true)}
          setAuthStatus(true)

          window.Twitch.ext.configuration.onChanged(() => {
            var broadcaster = window.Twitch.ext.configuration.broadcaster;

            if (broadcaster) {
                if (broadcaster.content) {
                    var config = {};
                    try {
                      config = broadcaster.content;
                    } catch (e) {
                      console.log(e);
                    }
          
                    console.log(window.Twitch.ext.configuration)
                    //do stuff with config
                }
            }
            console.log(broadcaster)
          });

          if (window?.Twitch?.ext?.configuration?.broadcaster?.content) {
            const { csocket } = require( './utils/sock')
            let socket = csocket()
            console.log("Joining the channel", window?.Twitch?.ext?.configuration?.broadcaster?.content)
            socket.emit("join", window?.Twitch?.ext?.configuration?.broadcaster?.content)
  
            socket.on("gamestate", (d) => {
              setGamestate(d)
            })
          }
          else {
            console.log("No configuration found, awaiting configuration by the streamer.")
          }
        })
        
        // return the unsubscribe function to let react handle the magic
        return () => {
          //twitch.unlisten('broadcast', () => console.log('Removed listeners'))
          const { csocket } = require( './utils/sock')
          let socket = csocket()
          socket.off('gs')
          socket.off('connect')
        }
      }
    }, [])

  const inputRef = React.createRef()

  const saveConfig = (conf) => {
    window.Twitch.ext.configuration.set('broadcaster', '1.0', (conf))
    setConfig(conf)
  }


  const onSubmit = (e) => {
    e.preventDefault()
    saveConfig(inputRef.current.value)
  }
  if (!authStatus && !!auth.getUserId()) {
    return <div>
      Loading....
    </div>
  }

  return (
    <div className='app'>
      {
        isConfig() && canConfig ? 
        <div className='config__container'>
          <form onSubmit={(e)=>onSubmit(e)}>
              <input 
                  className='form_text_input'
                  name="name" 
                  type="text" 
                  placeholder="name" 
                  ref={inputRef}
                  defaultValue={window?.Twitch?.ext?.configuration?.broadcaster?.content}
              />
              <br />
              <input className='submit_button' type="submit" value="Submit" />
          </form>
          <div className='config__container__footer'>
            Credits to Pennywise for the artwork, Chilleen for the design finesse and BoSen for the magic.
          </div>
        </div>
        :<><div className='wave__header'>
          <div>
            Wave {gamestate?.wave}: {getWaveImage(gamestate?.wave)}
          </div>
          <img src={`https://cdn.legiontd2.com/icons/${getWaveImage(gamestate?.wave)}.png`} title={getWaveImage(gamestate?.wave)}/>
        </div>
        <div>
          {
            getGameBoards(gamestate)
          }
        </div></>
      }
    </div>
  );
}
export default App;
