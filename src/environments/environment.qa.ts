// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl:'https://wp-service-uat-ygue7fpaba-uc.a.run.app/wearables',
  //baseUrl:'https://portal.qa.wearablesclinicaltrials.com/wearables_service',  
  baseUrl2:'',
  grantType: 'password',
  clientId: 'adminClientId',
  clientSecret: '$CLIENT_SECRET',
  tokenString: 'userToken',
  userId: 'userId',
  refreshTokenString: 'userRefreshToken'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
