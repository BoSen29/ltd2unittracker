import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://ltdunitsync-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app)