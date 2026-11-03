// This browser configuration identifies the Firebase project; it is not an admin credential.
import { initializeApp, getApps } from 'firebase/app';
import { initializeAnalytics, isSupported, setConsent, setAnalyticsCollectionEnabled, logEvent, setDefaultEventParameters } from 'firebase/analytics';
const firebaseConfig = {
  apiKey: 'AIzaSyC1ddNRsC9P2_kmb1ZEO00eu1YWUZYGqGA',
  authDomain: 'ghanastreetgames.firebaseapp.com',
  projectId: 'ghanastreetgames',
  storageBucket: 'ghanastreetgames.firebasestorage.app',
  messagingSenderId: '204819596102',
  appId: '1:204819596102:web:c009045742814a734f5b47',
  measurementId: 'G-TFT87BW5F7'
};
export { isSupported };
const consent = enabled => ({analytics_storage:enabled?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
let analytics;
export function enable(){
  setConsent(consent(true));
  if(!analytics){
    const app=getApps().find(a=>a.name==='ghana-street-games')||initializeApp(firebaseConfig,'ghana-street-games');
    const safePage={page_location:'https://ghanastreetgames.vercel.app/',page_referrer:'',page_title:'Ghana Street Games'};
    setDefaultEventParameters(safePage);
    analytics=initializeAnalytics(app,{config:{...safePage,send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_flags:'SameSite=Lax;Secure',cookie_expires:2592000}});
    setAnalyticsCollectionEnabled(analytics,true);
    logEvent(analytics,'page_view',safePage);
  }else setAnalyticsCollectionEnabled(analytics,true);
}
export function disable(){
  if(analytics){setAnalyticsCollectionEnabled(analytics,false);setConsent(consent(false));}
}
