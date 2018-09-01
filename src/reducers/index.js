import { combineReducers } from 'redux'
import { routerReducer as router } from 'connected-react-router'

export default function makeRootReducer () {
  return combineReducers({
    router
  })
}
