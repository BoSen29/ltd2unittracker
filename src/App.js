import './App.css';
import { useEffect, useState } from 'react';
//import { db } from './utils/db'
import Authentication from './utils/auth'
//import { onValue, ref } from 'firebase/database';


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
  let twitch = window.Twitch ? window.Twitch.ext : null
  const auth = new Authentication()

  // useEffect(() => {
  //   const query = ref(db, "bosen");
  //   return onValue(query, (snapshot) => {
  //     const data = snapshot.val()

  //     if(snapshot.exists()) {
  //       setGamestate(data)
  //     }
  //   })
  // }, [])

  useEffect(() => {
    if (twitch) {
      console.log("This is Twitch") 
      twitch.onAuthorized((a) => {
        auth.setToken(a.token, a.userId)
        
      })

      twitch.listen('broadcast', (target, contentType, body) => {
        this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
        console.log(`New pubsub message to ${target} with contentType ${contentType} and the body ${body}`)

        if (!!body)  {
          setGamestate(JSON.parse(body))
        }
      })
      // return the unsubscribe function to let react handle the magic
      return () => twitch.unlisten('broadcast', () => console.log('Removed listeners'))
    }
  }, [])

  return (
    <div className='app'>
      <div className='wave__header'>
        <div>
          Wave {gamestate?.wave}: {getWaveImage(gamestate?.wave)}
        </div>
        <img src={`https://cdn.legiontd2.com/icons/${getWaveImage(gamestate?.wave)}.png`} title={getWaveImage(gamestate?.wave)}/>
      </div>
      <div>
        {
          getGameBoards(gamestate)
        }
      </div>

    </div>
  );
}
//<script src="https://extension-files.twitch.tv/helper/v1/twitch-ext.min.js"></script>
export default App;
