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
    saveConfig(inputRef.current.value)
  }

  return (
    <>
      <form onSubmit={(e) => onSubmit(e)}>
        <input
          className='form-text__input'
          name='name'
          type='text'
          placeholder='name'
          ref={inputRef}
          defaultValue={window?.Twitch?.ext?.configuration?.broadcaster?.content}
        />
        <br/>
        <input className='submit__button' type='submit' value='Submit'/>
      </form>
      <div className='config-container__footer'>
        Credits to Pennywise for the artwork, Chilleen for the design finesse and BoSen for the magic.
      </div>
    </>
  )
}
