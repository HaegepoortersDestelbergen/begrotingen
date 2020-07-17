const firebaseConfig = {
    apiKey: "AIzaSyANqVN1iVF67T7u5ORMdwltm4-MCvz58Ig",
    authDomain: "begrotingen-haegepoorters.firebaseapp.com",
    databaseURL: "https://begrotingen-haegepoorters.firebaseio.com",
    projectId: "begrotingen-haegepoorters",
    storageBucket: "begrotingen-haegepoorters.appspot.com",
    messagingSenderId: "731795120815",
    appId: "1:731795120815:web:de415a05304bd46262ea5a"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

export {db}