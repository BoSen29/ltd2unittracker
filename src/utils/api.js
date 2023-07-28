import { BASEURL } from "./constants"

export const fetchWave = async (streamer, matchUUID, waveNumber) => {
    let req = await fetch(`${BASEURL}matches/${streamer}/${matchUUID}/wave/${waveNumber}`)
    if (req.status == 200) {
        let { matches } = await req.json()
        return matches
    }
    else {
        return []
    }
    
}

export const fetchMatches = async (streamer) => {
    let req =  await fetch(`${BASEURL}matches/${streamer}`)
    console.log(req)
    if (req.status == 200) {
        let { matches } = await req.json()
        return matches
    }
    else {
        return []
    }
}

export const fetchMatch = async (streamer, matchUUID) => {
    let req = await fetch(`${BASEURL}matches/${streamer}/${matchUUID}`)
    if (req.status == 200) {
        let { matches } =  await req.json()
        return matches
    }
    else {
        return []
    }
}

export const fetchCurrentMatch = async (streamer) => {
    let req = await fetch(`${BASEURL}matches/${streamer}/latest`)
    if (req.status == 200) {
        let { matches } =  await req.json()
        return matches
    }
    else {
        return []
    }
}