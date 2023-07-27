export const getEloImage = (elo) => {
  return !elo ? 'Nothing'
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