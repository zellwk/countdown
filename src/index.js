const timezones = require('./timezones')
const tokenStrings = require('./tokens')

module.exports = function initCountdown (countdown) {
  console.log(countdown);
  if (!countdown) throw new Error('No countdown detected')
  createCountdownChildElements(countdown)
  let targetTime = parseTargetTime(countdown)
  populateCountdown(countdown, targetTime)
}

// TODO: i18n tokens
function createCountdownChildElements (countdown) {
  if (!countdown.dataset.lang) countdown.dataset.lang = 'en'
  let tokens = tokenStrings[countdown.dataset.lang]
  let innerElements = tokens.map(token => {
    let elem = document.createElement('div')
    let time = document.createElement('span')
    let span = document.createElement('span')

    time.innerHTML = 0
    time.dataset.token = token.plural
    time.dataset.tokenSingular = token.singular
    span.innerHTML = token.plural

    elem.classList.add('c-countdown__inner')
    elem.appendChild(time)
    elem.appendChild(span)
    return elem
  })

  innerElements.forEach(el => countdown.appendChild(el))
}

function parseTargetTime (countdown) {
  if (!countdown.dataset.date) {
    throw new Error(`Countdown requires a target date.
      Set one with data-date="YYYY-MM-DD"`)
  }

  let targetTime = setTargetDate(countdown.dataset.date)
  return setTargetHours(targetTime, countdown.dataset.timezone)
}

/**
 * Set UTC target date
 * @param  {string} dateString - Target date in YYYY-MM-DD format
 * @return {int} - timestamp for target date at UTC midnight
 */
function setTargetDate (dateString) {
  let date = new Date()
  let targetDate = parseTargetDate(dateString)
  return date.setUTCFullYear(targetDate[0], targetDate[1], targetDate[2])
}

/**
 * Returns target date in array format
 * @param  {string} dateString - Target date in YYYY-MM-DD format
 * @return {array} - Returns date in: [year, month, day]
 */
function parseTargetDate (dateString) {
  let re = /(\d{4})-(\d{2})-(\d{2})/
  let matches = dateString.match(re)

  return matches.reduce((acc, match, index) => {
    if (index === 1 || index === 3) acc.push(parseInt(match))
    if (index === 2) acc.push(parseInt(match) - 1)
    return acc
  }, [])
}

/**
 * Set target time
 * @param {int} timestamp - timestamp of target date at UTC midnight
 * @param {string} timezone - target timezone
 */
function setTargetHours (timestamp, timezone) {
  let timezoneOffset = parseTimezone(timezone)
  let date = new Date(timestamp)
  return date.setUTCHours(timezoneOffset, 0, 0, 0)
}

/**
 * Returs timezone offset
 * @param  {string} timezone - Timezone string
 * @return {int}          - Timezone offset
 * TODO: Account for daylight savings time
 */
function parseTimezone (timezone) {
  let offset = timezones[timezone.toLowerCase()]

  if (offset) {
    return -offset
  } else {
    console.warn(`timezone ${timezone} is not found. Using GMT instead`)
    return 0
  }
}

/**
 * Populates and updates countdown timer
 * @param  {HTMLElement} countdown - countdown element
 * @param  {int} targetTime - target timestamp
 */
function populateCountdown (countdown, targetTime) {
  let interval = setInterval(updateCountdown, 1000)
  let tokens = countdown.querySelectorAll('[data-token]')

  function updateCountdown () {
    let timeRemaining = getTimeRemaining(targetTime)
    tokens.forEach(el => {
      let token = el.dataset.token
      let singular = el.dataset.tokenSingular
      let value = timeRemaining[token]
      let sibling = el.nextSibling

      el.innerHTML = value
      if (value === 1) {
        sibling.innerHTML = singular
      } else if (value !== 1 && sibling.innerHTML === singular) {
        sibling.innerHTML = token
      }
    })
  }
}

function getTimeRemaining (endtime) {
  var t = new Date(endtime) - new Date()
  var seconds = Math.floor((t / 1000) % 60)
  var minutes = Math.floor((t / 1000 / 60) % 60)
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24)
  var days = Math.floor(t / (1000 * 60 * 60 * 24))
  return {
    'total': t,
    days,
    hours,
    minutes,
    seconds
  }
}
