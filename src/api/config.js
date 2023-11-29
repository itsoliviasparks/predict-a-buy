import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyDp4TZd4myXzzsG8OIZe4JoXll8odAfJ4k',
	authDomain: 'predict-a-buy.firebaseapp.com',
	databaseURL: 'https://predict-a-buy-default-rtdb.firebaseio.com',
	projectId: 'predict-a-buy',
	storageBucket: 'predict-a-buy.appspot.com',
	messagingSenderId: '139758585971',
	appId: '1:139758585971:web:adc285b59988f34ac58206',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
