import './index.css'

import { createRef, useState } from 'react'

export default function Config() {

  const inputRef = createRef()
  const [config, setConfig] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const saveConfig = (conf) => {
    window.Twitch.ext.configuration.set('broadcaster', '1.0', (conf))
    setConfig(conf)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    saveConfig(inputRef.current.value)
    setTimeout(() => {
      setSubmitted(false)
    }, 5000);
  }

  return (
    <>
      <form onSubmit={(e) => onSubmit(e)}>
        <input
          className={`form-text__input ${submitted ? 'submitted__field': ''}`}
          name='name'
          type='text'
          placeholder='name'
          ref={inputRef}
          defaultValue={window?.Twitch?.ext?.configuration?.broadcaster?.content}
        />
        <br/>
        <input className={`submit__button ${submitted ? 'submitted__button': ''}`} type='submit' value='Submit'/>
      </form>
      {
        submitted && <p>THIS TEXT INDICATES THAT IT HAS BEEN SUBMITTED SUCCESSFULLY. A FEATURE REQUESTED BY LWON!</p>
      }
      <div className='config-container__footer'>
        Credits to Pennywise for the artwork, Chilleen for the design finesse and BoSen for the magic.
      </div>
    </>
  )
}
