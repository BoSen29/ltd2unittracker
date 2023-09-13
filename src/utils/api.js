import { BASEURL } from "./constants"

export const fetchWave = async (streamer, matchUUID, waveNumber) => {
    let req = await fetch(`${BASEURL}v2/matches/${streamer}/${matchUUID}/wave/${waveNumber}`)
    if (req.status === 200) {
        let { matches } = await req.json()
        return matches
    }
    else {
        return []
    }
}

export const fetchMatches = async (streamer) => {
    let req =  await fetch(`${BASEURL}v2/matches/${streamer}`)
    if (req.status == 200) {
        let { matches } = await req.json()
        return matches
    }
    else {
        return []
    }
}

export const fetchMatch = async (streamer, matchUUID) => {
    let req = await fetch(`${BASEURL}v2/matches/${streamer}/${matchUUID}`)
    if (req.status === 200) {
        let { matches } =  await req.json()
        return matches
    }
    else {
        return []
    }
}

export const fetchCurrentMatch = async (streamer) => {
    let req = await fetch(`${BASEURL}v2/matches/${streamer}/latest`)
    if (req.status === 200) {
        let { matches } =  await req.json()
        return matches
    }
    else {
        return []
    }
}

export const fetchUnits = async () => {
    let req = await fetch(`${BASEURL}units/units.json`, {
        method: 'GET', 
        mode: 'cors',
        headers: 
            {
                'Content-Type': 'application/json'
            }
        }
        )
    if (req.status === 200) {
        let units = await req.arrayBuffer()
        let dUnits = new TextDecoder("utf-16le").decode(units)        
        return JSON.parse(dUnits) || []
    }
    else {
        return []
    }
}