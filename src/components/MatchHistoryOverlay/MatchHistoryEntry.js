import './MatchHistoryEntry.css'
import { timeSince } from '../../utils/time'
import { getWaveImage, getEloImage, getLegionImage } from '../../utils/misc'

export default function MatchHistoryEntry({match, setMatchUUID, close, idx}) {
  match?.players?.map(p => {
    let temp = {}
    p.opener?.map(o => {
      temp[o] = (temp[o] || 0) +1
    })
    p.openerClean = [...Object.keys(temp).map(d => {
      return {
        "unit": d,
        "count": temp[d]
      }
    })]
  })  

  console.log(match.players)
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
            leftSide.map((p, i) =>
            <>
            { i > 0 && <hr style={{width:"100%"}}/>
            } 
              <div className='player__entry' key={i}>
                <img src={`https://cdn.legiontd2.com/icons/Ranks/${getEloImage(p.playerProfile.rating)}.png`} className='elo__img'/>
                <div className={'player' + p.player}>{p.playerProfile.name}</div>
                {
                  !!p.mvpScore && !!leftSide.find(l => l.mvpScore > p.mvpScore) && <div className='mvp'>[MVP]</div>
                }
                <div className='opener__container'>
                  {
                    !!p.openerClean && p.openerClean.map((o, ix) => {
                      return <span className='opener__entry'>
                          <img src={`https://cdn.legiontd2.com/${o.unit}`} key={i + 'opener' + ix } className='opener__img'/>
                          <span className='opener__count'>{o.count}</span>
                        </span>
                    })
                  }
                </div>
                <div className='spell__container scoreboard__container'>
                  <img src={`https://cdn.legiontd2.com/${p.spellIcon || 'unknown'}`} title={p.spell || 'unknown'}/>
                </div>
                <div className='legion__container scoreboard__container'>
                  <img src={`https://cdn.legiontd2.com/icons/Items/${getLegionImage(p.playstyleIcon)}`} title={p.playstyle || 'Unknown'}/>
                </div>
              </div>
              </>
            )
          }
          </div>
        </div>
        <div className={['side__container', match.rightWon ? 'won' : 'lost'].join(' ')}>
          <div className='players__container'>
          {
            rightSide.map((p, i) =>
              <>
                { i > 0 && <hr style={{width:"100%"}}/>
                } 
                <div className='player__entry' key={i}>
                  <img src={`https://cdn.legiontd2.com/icons/Ranks/${getEloImage(p.playerProfile.rating)}.png`}  className='elo__img'/>
                  <div className={'player' + p.player}>{p.playerProfile.name}</div>
                  {
                  !!p.mvpScore && !!rightSide.find(l => l.mvpScore > p.mvpScore) && <div className='mvp'>[MVP]</div>
                  }
                <div className='opener__container'>
                  {
                    !!p.openerClean && p.openerClean.map((o, ix) => {
                      return <span className='opener__entry'>
                          <img src={`https://cdn.legiontd2.com/${o.unit}`} key={i + 'opener' + ix } className='opener__img'/>
                          <span className='opener__count'>{o.count}</span>
                        </span>
                    })
                  }
                </div>
                  <div className='spell__container scoreboard__container'>
                    <img src={`https://cdn.legiontd2.com/${p.spellIcon || 'unknown'}`} title={p.spell || 'unknown'}/>
                  </div>
                  <div className='legion__container scoreboard__container'>
                    <img src={`https://cdn.legiontd2.com/icons/Items/${getLegionImage(p.playstyleIcon)}`} title={p.playstyle || 'Unknown'}/>
                  </div>
                </div>
              </>
            )
          }
          </div>
        </div>
      </div>
    </div>
  )
}
