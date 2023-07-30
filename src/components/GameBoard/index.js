import './index.css'
import {useEffect, useRef, useState} from 'react'
import {getLeakDangerLevel } from '../../utils/misc'

export default function GameBoard({player, units, mercsReceived = [], wave, recceived = [], leaks = []}) {
  const [clipboardData, setClipboardData] = useState("")
  const [showClipboard, setShowClipboard] = useState(false)

  const copyToClipboard = () => {
    setShowClipboard(true)
    const value = {Towers: [], Wave: wave}
    value.Towers = units.map((unit) => {
      return {
        T: unit.displayName,
        X: unit.x / 2 - 4.5,
        Z: unit.y / 2 - 7,
        S: 0
      }
    })
    value.Mythium = recceived?.map(r => r.amount)[0]
    value.Gold = 0
    setClipboardData(JSON.stringify(value))

    const timeOut = setTimeout(() => {
      setShowClipboard(false)
    }, 10000)

    return () => clearTimeout(timeOut)
    
    //await navigator.clipboard.writeText(JSON.stringify(value))
  }

  let recceivedNum = recceived?.map(r => r.amount)
  let leakedNum = leaks?.map(l => l.percentage)
  if (!!!player.name) { return }

  return (
    <div className='game-board__container'>
      <div className='game-board__header'>
        <img src={player.image} title="Avatar" className='header__icon'/>
        <div className='player-info__container'>
          <img src={player.countryFlag} title={player.countryName} className='country__icon'/>
          <div className={'player'+player.player}>
            {
              player.name || 'Player ' + player.player
            }
          </div>
        </div>
        <img src={player.ratingIcon} title={player.rating} className='header__icon'/>
      </div>
      {
        wave > 0 && <span><div className='myth__region__container'>
        <div className='sends__container'>
          {
            mercsReceived?.map((merc, idx) => {
              return (
                <span className='send__icon__container'>
                  <img src={`https://cdn.legiontd2.com/${merc.image}`} className='send__icon' key={idx}/>
                  <span className='sends__count'>{merc.count}</span>
                </span>
                
              )
            })
          }
        </div>
        <div className='mythium__container'>
          <span className='mythium__text'>
          {
            recceivedNum
          }
          </span>
          <img src={`https://cdn.legiontd2.com/Icons/Mythium.png`} className='myth__icon' key={"mythium"}/>
        </div>
      </div>
      {
        showClipboard? 
      <div className='clipboard'>
        <textarea value={clipboardData} readOnly onMouseEnter={(e) => e.target.select()} onMouseLeave={(e) => setShowClipboard(false)}/>
      </div> :
      <div className='game-board'>
        {
          units?.map((unit, idx) => {
            return (
              // we need to "fix" the row start since the data is in format of an actual coordinate system starting bottom left
              <img src={`https://cdn.legiontd2.com/${unit.name}`} className='unit__icon' style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}} key={idx} title={unit.name.split('/')[1].replace(".png",'')}/>
            )
          })
        }
      </div>
      }
      <div className={['player__color-marker', 'player'+player.player+'__background'].join(' ')}/>
      <div className='game-board__footer'>
        <div className='leak__container'>
          {
            leakedNum > 0 && <div style={{color: getLeakDangerLevel(leakedNum)}} className='leak__number'>{leakedNum}% leak</div>
          }
        </div>
        {
          !showClipboard ? <div className={'copy-button'} onClick={copyToClipboard}>{'Copy build'}</div>:
          <div className={'copy-button'} onClick={() => setShowClipboard(false)}>{'Hide'}</div>
        }
      </div></span>
      }
      
    </div>
  )
}
