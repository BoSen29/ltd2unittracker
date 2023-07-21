import './index.css'

export default function GameBoard({player, units, mercsSent, mercsReceived}) {
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
      <div className='game-board'>
        {
          units.map((unit, idx) => {
            return (
              // we need to "fix" the row start since the data is in format of an actual coordinate system starting bottom left
              <img src={unit.icon} className='unit__icon' style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}} key={idx}/>
            )
          })
        }
      </div>
      <div className={['player__color-marker', 'player'+player.player+'__background'].join(' ')}/>
    </div>
  )
}
