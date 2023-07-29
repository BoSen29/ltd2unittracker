import './index.css'
import {getKingHPDangerLevel, getWaveImage} from '../../utils/misc'

export default function WaveHeader({wave, setWave, goToLive, westKing, eastKing, isTailing}) {

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
      <span className='wave__title__panel'>
        ↓
      <div className='wave__description'>
        Wave {wave}: {getWaveImage(wave)}
      </div>
      <img src={`https://cdn.legiontd2.com/icons/${getWaveImage(wave)}.png`} title={getWaveImage(wave)} className='wave__creep__icon'/>
        ↓
      </span>
      {
        isTailing && <span className='icon__recording'></span>
      }
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
