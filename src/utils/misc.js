export const getEloImage = (elo) => {
  return !elo ? 'Unranked'
    : elo > 2799 ? 'Legend'
    : elo > 2599 ? 'Grandmaster'
    : elo > 2399 ? 'SeniorMaster'
    : elo > 2199 ? 'Master'
    : elo > 1999 ? 'Expert'
    : elo > 1799 ? 'Diamond'
    : elo > 1599 ? 'Platinum'
    : elo > 1399 ? 'Gold'
    : elo > 1199 ? 'Silver'
    : elo > 999 ? 'Bronze'
    : 'Unranked'
}

export const isDev = () => {
  return process.env.NODE_ENV === 'development'
}

export const resturcturePlayerData = (raw) => {
  const gameState = {
    players: {},
  }
  if (!!!raw?.players) { return gameState}
  for (let playerData of raw?.players) {
    const player = {}
    player.player = playerData.player
    player.name = playerData.playerProfile.name
    player.rating = playerData.playerProfile.rating
    player.ratingIcon = `https://cdn.legiontd2.com/icons/Ranks/${getEloImage(playerData.playerProfile.rating)}.png`
    player.image = `https://cdn.legiontd2.com/${playerData.playerProfile.image}`
    player.countryCode = playerData.playerProfile.countryCode
    player.countryName = playerData.playerProfile.countryName
    if (player.countryName === "United States") {
      player.countryCode = "us"
    }
    player.countryFlag = `https://cdn.legiontd2.com/flags/4x3/${player.countryCode}.png`
    gameState.players[playerData.player] = player
  }

  return gameState
}

export const getWaveImage = (wave) => {
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

export const getLeakDangerLevel = (percentage) => {
  return !percentage ? 'White':
    percentage > 79? 'red': 
    percentage > 39? 'orange':
    'yellow'
}

export const is2v2 = (players) => {
  try {
    return Object.keys(players).length > 4? false: true
  }
  catch {
    return true
  }
}

export const getKingHPDangerLevel = (percentage) => {
  return !percentage ? 'red':
    percentage > 79? 'green': 
    percentage > 39? 'orange':
    'red'
}