import './index.css'

function getWaveImage(wave) {
  return !wave ? 'Nothing' :
    wave > 20 ? 'LegionLord' :
    wave > 19 ? 'Maccabeus' :
    wave > 18 ? 'DireToad' :
    wave > 17 ? 'WaleChief' :
    wave > 16 ? 'MetalDragon' :
    wave > 15 ? 'Cardinal' :
    wave > 14 ? 'Quadrapus' :
    wave > 13 ? 'KillerSlug' :
    wave > 12 ? 'DrillGolem' :
    wave > 11 ? 'Mantis' :
    wave > 10 ? 'QuillShooter' :
    wave > 9 ? 'Granddaddy' :
    wave > 8 ? 'Carapace' :
    wave > 7 ? 'Kobra' :
    wave > 6 ? 'Sludge' :
    wave > 5 ? 'Rocko' :
    wave > 4 ? 'Scorpion' :
    wave > 3 ? 'FlyingChicken' :
    wave > 2 ? 'Hopper' :
    wave > 1 ? 'Wale' :
      'Crab'
}

export default function WaveHeader({wave}) {
  return (
    <div className='wave__header'>
      <div>
        Wave {wave}: {getWaveImage(wave)}
      </div>
      <img src={`https://cdn.legiontd2.com/icons/${getWaveImage(wave)}.png`} title={getWaveImage(wave)}/>
    </div>
  )
}
