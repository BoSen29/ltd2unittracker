import './MatchHistoryEntry.css'
import { timeSince } from '../../utils/time'
import { getWaveImage, getEloImage, getLegionImage } from '../../utils/misc'

export default function MatchHistoryEntry({match, setMatchUUID, close, idx}) {

  const leftSide = match.players.filter(p => p.player <= 4)
  const rightSide = match.players.filter(p => p.player > 4)
  const averageElo = Math.floor(match.players.reduce((acc, p) => acc + p.playerProfile.rating, 0) / match.players.length)
  const headerCurrentWave = match.endedOn || idx !== 0 ? <div>{match.endedOn && `Wave ${match.endedOn}`}</div> : <div style={{color: 'red', fontWeight: 700}}>Live</div>

  return (
    <div className='match-history__container' onClick={() => {
      setMatchUUID(match.uuid)
      close()
    }}>
      <div className='match-history__header'>
        <div>{timeSince(Date.parse(match.started))} ago</div>
        {headerCurrentWave}
        <div>{averageElo} average rating</div>
      </div>
      <div className='match-history__content'>
        <div className='match-history__result'>
          {match.endedOn &&
            <img src={`https://cdn.legiontd2.com/icons/${getWaveImage(match.endedOn)}.png`}/>
          }
        </div>
        <div className={['side__container', match.leftWon ? 'won' : 'lost'].join(' ')}>
          <div className='players__container'>
          {
            leftSide.map((p) =>
              <div className='player__entry'>
                <img src={`https://cdn.legiontd2.com/icons/Ranks/${getEloImage(p.playerProfile.rating)}.png`}/>
                <div className={'player' + p.player}>{p.playerProfile.name}</div>
                <div className='legion__container'>
                  <div>Legion</div>
                  <img src={`https://cdn.legiontd2.com/icons/Items/${getLegionImage(p.legion)}.png`}/>
                </div>
                <div className='spell__container'>
                  <div>Spell</div>
                  <img src={`https://cdn.legiontd2.com/icons/${p.mastermind}.png`}/>
                </div>
              </div>
            )
          }
          </div>
        </div>
        <div className={['side__container', match.rightWon ? 'won' : 'lost'].join(' ')}>
          <div className='players__container'>
          {
            rightSide.map((p) =>
              <div className='player__entry'>
                <img src={`https://cdn.legiontd2.com/icons/Ranks/${getEloImage(p.playerProfile.rating)}.png`}/>
                <div className={'player' + p.player}>{p.playerProfile.name}</div>
                <div className='legion__container'>
                  <div>Legion</div>
                  <img src='https://cdn.legiontd2.com/icons/Units/legion.png'/>
                </div>
                <div className='spell__container'>
                  <div>Spell</div>
                  <img src='https://cdn.legiontd2.com/icons/Units/spell.png'/>
                </div>
              </div>
            )
          }
          </div>
        </div>
      </div>
    </div>
  )
}
