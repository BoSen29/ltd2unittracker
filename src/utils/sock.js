import { io } from 'socket.io-client'
const socket = io("https://ltd2unittracker-4q7eg.ondigitalocean.app/")

socket.on("connect", (d) => {
  console.log("Socket connected")
})

export const csocket = () => {
    return socket
}