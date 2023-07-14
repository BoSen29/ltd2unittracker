import { io } from 'socket.io-client'
const socket = io("https://ltd2.krettur.no/")

socket.on("connect", (d) => {
  console.log("Socket connected")
})

export const csocket = () => {
    return socket
}