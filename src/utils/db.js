import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  databaseURL: "wss://ltdunitsync-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp({});
export const db = getDatabase(app,"wss://ltdunitsync-default-rtdb.europe-west1.firebasedatabase.app/")