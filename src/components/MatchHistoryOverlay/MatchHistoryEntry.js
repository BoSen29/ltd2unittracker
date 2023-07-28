import './MatchHistoryEntry.css'
import { timeSince } from '../../utils/time'

export default function MatchHistoryEntry({match, setMatchUUID, close}) {

  const leftSide = match.players.filter(p => p.player <= 4)
  const rightSide = match.players.filter(p => p.player > 4)

  return (
    <div className='match-history__container' onClick={() => {
      setMatchUUID(match.uuid)
      close()
    }}>
      <div className='match-history__header'>
        {match.uuid} - {timeSince(Date.parse(match.started))} ago
      </div>
      <div className='match-history__content'>
        <div className='side__container'>
          <div className='players__container'>
          {
            leftSide.map((p) => <div className={'player' + p.player}>{p.playerProfile.name}</div>)
          }
          </div>
        </div>
        <div className='side__container'>
          <div className='players__container'>
          {
            rightSide.map((p) => <div className={'player' + p.player}>{p.playerProfile.name}</div>)
          }
          </div>
        </div>
      </div>
    </div>
  )
}
