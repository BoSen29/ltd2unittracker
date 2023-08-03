import './index.css'
import {getKingHPDangerLevel, getWaveImage} from '../../utils/misc'
import { useState } from 'react'

export default function WaveHeader({wave, setWave, goToLive, westKing, eastKing, availableWaves = []}) {
  const [selectorHidden, setSelectorHidden] = useState(true)

  const clickWave = (targetWave) => {
    return () => {
      setWave(targetWave)
    }
  }
  const clickGotoLive = () => {
    return () => {
      goToLive()
    }
  }
  if (isNaN(wave)) { return }
  return (
    <div className='wave__header'>
      <div className='wave__kingHP wave__westKing'>
        <div className='wave__health_bar wave__westKing__health_bar'
            style={{
              width: `${westKing}%`,
              backgroundColor: `${getKingHPDangerLevel(westKing)}`
            }}
          />
        <div className='wave__health_text'>
          {westKing}%
        </div>  
      </div>
      <img src='https://cdn.legiontd2.com/icons/EarthKing.png' title='EarthKing' className='wave__king__icon wave__westKing__icon'/>
      <span className='wave__title__panel' onMouseEnter={() => setSelectorHidden(false)} onMouseLeave={() => {setSelectorHidden(true)}}>
        ↓
        <div className='wave__description'>
        { !!wave && 
            <span className='wave__name'>
              Wave {wave || 0}: {getWaveImage(wave || 0)}
            </span>
            }
          <div className='wave__selector__container' hidden={selectorHidden}>
            <div className='wave__selector'>
            {
              availableWaves && (availableWaves || [])?.map(a => {
                return <div className='wave__select__container'  onClick={() => {
                  clickWave(a)()
                  }
                }>
                    <img src={`https://cdn.legiontd2.com/icons/${getWaveImage(a)}.png`} title={"Wave " + a} className='wave__select__icon'/>
                    <div className='wave__select__text'>{a}</div>
                  </div>
              })
            }
            </div>
          </div>

        </div>
        <img src={`https://cdn.legiontd2.com/icons/${getWaveImage(wave || 'nothing')}.png`} title={getWaveImage(wave || 0)} className='wave__creep__icon'/>
        ↓
      </span>
      <img src='https://cdn.legiontd2.com/icons/SkyKing.png' title='Skyking' className='wave__king__icon wave__eastKing__icon'/>
      <div className='wave__kingHP wave__eastKing'>
        <div className='wave__health_bar wave__eastKing__health_bar'
          style={{
            width: `${eastKing}%`,
            backgroundColor: `${getKingHPDangerLevel(eastKing)}`
          }}
        />
        <div className='wave__health_text'>
          {eastKing}%
        </div>
        
      </div>

    </div>
  )
}
