import './index.css'
import {getWaveImage} from '../../utils/misc'

export default function WaveHeader({wave, setWave, finalWave, liveWave, goToLive}) {

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
      
      
    </div>
  )
}
