import firebase from 'firebase/app'
import 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcg4wsWIGDIT8kHWjmzZHHuaGwW-RJEEU",
  authDomain: "storm-36fde.firebaseapp.com",
  projectId: "storm-36fde",
  storageBucket: "storm-36fde.appspot.com",
  messagingSenderId: "200156312857",
  appId: "1:200156312857:web:7bc8dace8e9f2ee3268188"
};

// Get a Firestore instance
export default firebase.initializeApp(firebaseConfig)
