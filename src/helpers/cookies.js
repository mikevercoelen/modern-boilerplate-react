import Cookies from 'universal-cookie'

let cookies = null

const initialize = (_cookies = new Cookies()) => {
  cookies = _cookies
}

export {
  cookies,
  initialize
}
