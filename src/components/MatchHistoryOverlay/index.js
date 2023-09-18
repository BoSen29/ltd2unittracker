import './index.css'
import { useState, useEffect } from 'react'
import {fetchMatches} from '../../utils/api'
import MatchHistoryEntry from './MatchHistoryEntry'
import { isStandalone } from '../../utils/misc'

export default function MatchHistoryOverlay({isOpen, player, setOpen, setMatchUUID}) {

  const [history, setHistory] = useState()

  useEffect(() => {
    if (!isOpen) return
    fetchMatches(player)
      .then(setHistory)
  }, [player, isOpen])

  if (isOpen) {
    return <div className='drawer__container' onClick={() => setOpen(false)}>
      <div className='drawer__content' onClick={(e) => e.stopPropagation()}>
        {
          history?.map((match, idx) => <MatchHistoryEntry match={match} player={player} setMatchUUID={setMatchUUID} close={() => setOpen(false)} idx={idx}/>)
        }
      </div>
    </div>
  } else {
    return <button className={`drawer__button button_bottomrow ${isStandalone() ? 'floor_me' :''}`} onClick={() => setOpen(true)}>
      Matches
    </button>
  }
}
