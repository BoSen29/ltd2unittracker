import './index.css'
import {useEffect, useState} from 'react'
import { fetchWave } from '../../utils/api'

export default function GameBoard({player, units, mercsReceived = [], wave}) {

  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (copied) setCopied(false)
    }, 1500)

    return () => clearTimeout(timeOut)
  }, [copied])

  //console.log(units)
  console.log(mercsReceived)

  const copyToClipboard = async () => {
    const value = {Towers: [], Wave: wave}
    value.Towers = units.map((unit) => {
      return {
        T: unit.id,
        X: unit.x / 2 - 4.5,
        Z: unit.y / 2 - 7,
        S: 0
      }
    })

    await navigator.clipboard.writeText(JSON.stringify(value))
    setCopied(true)
  }

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
      <div className='sends__container'>
        {
          mercsReceived?.map((merc, idx) => {
            return (
              <span className='send__icon'>
                <img src={`https://cdn.legiontd2.com/${merc.image}`} className='send__icon' key={idx}/>
                <span className='sends__count'>{merc.count}</span>
              </span>
              
            )
          })
        }
      </div>
      <div className='game-board'>
        {
          units?.map((unit, idx) => {
            return (
              // we need to "fix" the row start since the data is in format of an actual coordinate system starting bottom left
              <img src={`https://cdn.legiontd2.com/${unit.name}`} className='unit__icon' style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}} key={idx}/>
            )
          })
        }
      </div>
      <div className={['player__color-marker', 'player'+player.player+'__background'].join(' ')}/>
      <div className={copied ? 'copy-button copied' : 'copy-button'} onClick={copyToClipboard}>{copied ? 'Build copied' : 'Copy build'}</div>
    </div>
  )
}
