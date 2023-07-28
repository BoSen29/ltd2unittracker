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

  for (let playerData of raw.players) {
    const player = {}
    player.player = playerData.player
    player.name = playerData.playerProfile.name
    player.rating = playerData.playerProfile.rating
    player.ratingIcon = `https://cdn.legiontd2.com/icons/Ranks/${getEloImage(playerData.playerProfile.rating)}.png`
    player.image = `https://cdn.legiontd2.com/${playerData.playerProfile.image}`
    player.countryCode = playerData.playerProfile.countryCode
    player.countryName = playerData.playerProfile.countryName
    if (player.countryName === "United States") {
      player.countryCode = "US"
    }
    player.countryFlag = `https://cdn.legiontd2.com/flags/4x3/${playerData.playerProfile.countryCode}.png`
    gameState.players[playerData.player] = player
  }

  return gameState
}
