import './index.css'

export default function MatchHistoryOverlay({isOpen, matches, player, setOpen}) {

  if (isOpen) {
    return <div className='drawer__container' onClick={() => setOpen(false)}>
      <div className='drawer__content' onClick={(e) => e.stopPropagation()}>
        Overlay
      </div>
    </div>
  } else {
    return <div className='drawer__button' onClick={() => setOpen(true)}>
      <svg className='drawer__menu-icon'>
	      <path d="M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2
		      c-1.104,0-2,0.896-2,2c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855,10.375,22.75,10.375z M22.75,18.875H2
		      c-1.104,0-2,0.896-2,2s0.896,2,2,2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z"
        />
      </svg>
    </div>
  }
}
