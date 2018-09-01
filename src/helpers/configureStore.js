import createSagaMiddleware, { END } from 'redux-saga'
import { createStore, applyMiddleware, compose } from 'redux'
import { initialize as initCookies } from 'helpers/cookies'
import makeRootReducer from 'reducers'
import { connectRouter, routerMiddleware } from 'connected-react-router'

export default function configureStore (history, initialState = {}) {
  initCookies()

  const enhancers = []

  if (process.env.NODE_ENV === 'development') {
    const devToolsExtension = window.devToolsExtension
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension())
    }
  }

  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(
    connectRouter(history)(makeRootReducer()),
    initialState,
    compose(
      applyMiddleware(
        routerMiddleware(history),
        sagaMiddleware
      ),
      ...enhancers
    )
  )

  store.sagaMiddleware = createSagaMiddleware
  store.runSaga = sagaMiddleware.run
  store.close = () => store.dispatch(END)
  return store
}
