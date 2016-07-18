import {Injectable} from '@angular/core';
import {ActionReducer, Dispatcher, State} from '@ngrx/store';
import {FirebaseAuthState, FirebaseAuth} from 'angularfire2';
import { StateUpdates, Effect } from '@ngrx/effects';

// Action Types
export const LOG_IN = '[auth] LOGIN';
export const AUTH_SUCCESS = '[auth] AUTH_SUCCESS';
export const AUTH_FAILURE = '[authFAILURE AUTH_FAILURE';
export const LOG_OUT = '[auth] LOG_OUT';

// Action Helpers
@Injectable()
export class AuthActions {
  constructor(public dispatcher: Dispatcher) {}

  login(provider) {
    this.dispatcher.dispatch({ type: LOG_IN, payload: provider });
  }
  logout() {
    this.dispatcher.dispatch({ type: LOG_OUT });
  }
  authSuccess(authInfo: FirebaseAuthState) {
    this.dispatcher.dispatch({ type: AUTH_SUCCESS, payload: authInfo });
  }
  authFailure(error) {
    this.dispatcher.dispatch({ type: AUTH_FAILURE, payload: error });
  }
}

// Model
export interface AuthModel {
  authenticating: boolean;
  authInfo: FirebaseAuthState;
}
export class AuthState extends State<AuthModel> {}
export const INITIAL_VALUE: AuthModel = {authenticating: false, authInfo: null};
export const WAITING_FOR_AUTHENTICATION_VALUE = {authenticating: true, authInfo: null};

// Reducer
export const authReducer: ActionReducer<AuthModel> = (state = INITIAL_VALUE, action) => {
  switch (action.type) {
    case LOG_IN:
      return WAITING_FOR_AUTHENTICATION_VALUE;
    case AUTH_SUCCESS:
      return {authenticating: false, authInfo: action.payload};
    case AUTH_FAILURE:
    case LOG_OUT:
      return INITIAL_VALUE;
    default:
      return state;
  }
};

// Selectors
export function selectIsLoggedIn(auth$: AuthState) {
  return auth$.map(auth => !!auth.authInfo);
}

// Effects
@Injectable()
export class AuthEffects {
  constructor(private update$: StateUpdates<any>, private auth: FirebaseAuth, private actions: AuthActions) {}

  @Effect()
  logout = this.update$
    .whenAction(LOG_OUT)
    .map(() => this.auth.logout());

  @Effect()
  login = this.update$
    .whenAction(LOG_IN)
    .map(update => {
      this.auth.login()
        .then(
          authInfo => this.actions.authSuccess(authInfo),
          error => this.actions.authFailure(error)
        );
    }
    );

  @Effect()
  authenticationFailure = this.update$
    .whenAction(AUTH_FAILURE)
    .map(update => console.log(update.action.payload));
}