import './index.css'
import {getKingHPDangerLevel, getWaveImage} from '../../utils/misc'

export default function WaveHeader({wave, setWave, finalWave, liveWave, goToLive, westKing, eastKing}) {

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
      <button disabled={wave <= 1} className={['wave-change__button', wave > 1 ? '' : 'disabled'].join(' ')} onClick={clickWave(wave - 1)}>&lt;</button>
      <div className='wave__description'>
        Wave {wave}: {getWaveImage(wave)}
      </div>
      <img src={`https://cdn.legiontd2.com/icons/${getWaveImage(wave)}.png`} title={getWaveImage(wave)}/>
      <button disabled={wave === finalWave || wave === liveWave} className={['wave-change__button', wave !== finalWave ? '': 'disabled'].join(' ')} onClick={clickWave(wave + 1)}>&gt;</button>
      {
        wave === liveWave ? 
        <div className={wave === finalWave ? 'wave__is-final' : wave === liveWave ? 'wave__is-live' : 'display-none'}>{wave === finalWave ? 'ended' : 'live'}</div> 
        :
        <div className='wave__is-not-live' onClick={clickGotoLive()}>Go to live game</div>
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
