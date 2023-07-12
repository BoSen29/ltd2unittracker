import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { db } from './utils/db'
import { onValue, ref } from 'firebase/database';


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

const getGameBoards = (units) => {
  let gameBoards = []
  let p = [1,2,5,6]
  let key = 0;
  p.forEach(i => {
    gameBoards.push(<div className='GameBoardContainer'>
      <div className='GameBoardHeader'>
        Player {i}
      </div>
      <div className='GameBoard'>
      {
        units?.filter(u => u.player == i)?.map(u => {
          key++
          const uri = `https://cdn.legiontd2.com/icons/${u.name}.png`
          const pconfig = players.filter(p => p.number == i)[0]
          const left = (u.x - pconfig.xmin - 0.5) === 0 ? 0 : 100 / (pconfig.xmax - pconfig.xmin) *(u.x - pconfig.xmin - 0.5)
          const bottom = (u.y - yBuildings[0] - 0.5) === 0 ? 0 : 100 / (yBuildings[1] - yBuildings[0]) * (u.y - yBuildings[0] - 0.5)
          return <img src={uri} title={u.name} key={key + "randomkey"} className='unitIcon' style={
            {
              left: left + "%",
              bottom: bottom + "%"
            }
          }></img>
        })
      }
    </div></div>)
  })
  return gameBoards
}

function App() {
  const [gamestate, setGamestate] = useState({})
  useEffect(() => {
    const query = ref(db, "bosen");
    return onValue(query, (snapshot) => {
      const data = snapshot.val()

      if(snapshot.exists()) {
        setGamestate(data)
      }
    })
  }, [])

  let i = 0;
  return (
    <div className="App">
      <div className='waveHeader'> 
        Wave : {gamestate?.wave} 
      </div>
      <div className='UnitBoard'>
        {
          getGameBoards(gamestate?.units)
        }
      </div>
      
    </div>
  );
}
//<script src="https://extension-files.twitch.tv/helper/v1/twitch-ext.min.js"></script>
export default App;
