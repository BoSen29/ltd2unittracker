import './index.css'
import { useState } from 'react'
import { getLeakDangerLevel } from '../../utils/misc'
import { HoverableIcon } from '../HoverableIcon'

export default function GameBoard({ player, units, mercsReceived = [], wave, recceived = [], leaks = [], postGameStats = [], idx, MMAndSpell = [] }) {
  const [clipboardData, setClipboardData] = useState("")
  const [showClipboard, setShowClipboard] = useState(false)
  const [leakedCreeps, setLeakedCreeps] = useState(false)

  const copyToClipboard = () => {
    setShowClipboard(true)
    const value = { Towers: [], Wave: wave }
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
  }
  let recceivedNum = recceived?.map(r => r.amount)
  let leakedNum = leaks?.map(l => l.percentage)
  if (!!!player.name) { return }
  let pgs = postGameStats[0] || null
  return (
    <div className='game-board__container' key={idx}>
      <div className='game-board__header'>
        <img src={player.image} title="Avatar" className='header__icon' />
        <div className='player-info__container'>
          <img src={player.countryFlag} title={player.countryName} className='country__icon' />
          <div className={'player' + player.player}>
            {
              player.name || 'Player ' + player.player
            }
          </div>
        </div>
        <img src={player.ratingIcon} title={player.rating} className='header__icon' />
      </div>
      {
        !!pgs?.rolls && pgs?.rolls?.length > 0 && <div className='game-board__rolls'>
          {
            pgs?.rolls.map((u, i) => {
              return <img
                src={`https://cdn.legiontd2.com/${u}`}
                className={`img__roll`}
                data-tooltip-id='Tooltipper'
                data-unit-image={u}
                key={i}
              />
            })
          }
          {
            !!MMAndSpell[0] && MMAndSpell[0].playstyleIcon && <img
              src={`https://cdn.legiontd2.com/${MMAndSpell[0].playstyleIcon}`}
              className={`img__mm`}
              data-tooltip-id='Tooltipper'
              data-unit-image={MMAndSpell[0].playstyleIcon}
              key={7}
            />
          }
          {
            !!MMAndSpell[0] && MMAndSpell[0].spellIcon && <img
              src={`https://cdn.legiontd2.com/${MMAndSpell[0].spellIcon}`}
              className={`img__spellchoice`}
              data-tooltip-id='Tooltipper'
              data-unit-image={MMAndSpell[0].spellIcon}
              key={7}
            />
          }

        </div>
      }
      {
        !isNaN(wave) && <span className='game-board-body'>
          <div className='myth__region__container'>
            <div className='sends__container'>
              {
                mercsReceived?.map((merc, idx) => {
                  return (
                    <span
                      className={`send__icon__container`}
                      data-tooltip-id='Tooltipper'
                      data-unit-image={merc.image}
                    >
                      <img src={`https://cdn.legiontd2.com/${merc.image}`} className={`send__icon`} key={idx} />
                      <span className='sends__count'>{merc.count}</span>
                    </span>
                  )
                })
              }
            </div>
            <div className='stats__container'>
              {
                pgs?.workers ? <span className='stats__entry'>
                  <span className='workers__text stats__text'>
                    {pgs?.workers}
                  </span>
                  <img src={`https://cdn.legiontd2.com/Icons/Worker.png`} className='stats__icon' key={'stats'} />
                </span> : <span className='stats__entry' />
              }
              {
                pgs?.fighterValue ?
                  <span className='stats__entry'
                    data-tooltip-id='ValueTipper'
                    data-fightervalue={pgs?.fighterValue}
                    data-recommended-value={pgs?.recommendedValue}
                  >
                    <span className='stats__text'>
                      {
                        pgs?.fighterValue
                      }
                    </span>
                    <img src={`https://cdn.legiontd2.com/Icons/Value.png`} className='stats__icon' key={'figherValue'} />
                  </span> : <span className='stats__entry' />
              }
              <span className='stats__entry'>
                <span className='mythium__text stats__text'>
                  {
                    recceivedNum
                  }
                </span>
                <img src={`https://cdn.legiontd2.com/Icons/Mythium.png`} className='myth__icon' key={"mythium"} />
              </span>
            </div>
          </div>
          {
            showClipboard ?
              <div className='clipboard'>
                <textarea value={clipboardData} readOnly onMouseEnter={(e) => e.target.select()} onMouseLeave={(e) => setShowClipboard(false)} />
              </div> :
              <div className='game-board'>
                {
                  units?.map((unit, idx) => {
                    return (
                      // we need to "fix" the row start since the data is in format of an actual coordinate system starting bottom left
                      <HoverableIcon
                        unit={unit}
                        className={'unit__icon'}
                        idx={idx}
                      />
                    )
                  })
                }
              </div>
          }
          <div className={['player__color-marker', 'player' + player.player + '__background'].join(' ')} />
        </span>
      }
      <div className='game-board__footer'>
        <div className='leak__container'>
          {
            leakedNum > 0 && <span onMouseEnter={() => setLeakedCreeps(true)} onMouseLeave={() => setLeakedCreeps(false)}>
              <span hidden={!leakedCreeps}>
                <span className='leaked__creeps__container'>
                  {
                    pgs?.unitsLeaked?.map(l => {
                      return <img
                        src={`https://cdn.legiontd2.com/${l.replace('hud/img/', '')}`}
                        className={`img__leaked__unit`}
                        data-tooltip-id='Tooltipper'
                        data-unit-image={l.replace('hud/img/', '')}
                      />
                    })
                  }
                </span>
              </span>
              <div style={{ color: getLeakDangerLevel(leakedNum) }} className='leak__number'>{leakedNum}% leak {!!pgs?.unitsLeaked ? '↑' : ''}</div>
            </span>
          }
        </div>
        {
          !showClipboard ? <div className={'copy-button'} onClick={copyToClipboard}>{'Copy build'}</div> :
            <div className={'copy-button'} onClick={() => setShowClipboard(false)}>{'Hide'}</div>
        }
      </div>
    </div>
  )
}
