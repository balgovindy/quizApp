
$(document).ready(() => {
  $.getJSON('myApp.json', getJSONData)
})

const getJSONData = (data) => {
  window.qBank = data.qBankArr;
  window.currentpart = 0;
  window.currentresponse = undefined
  window.qBank.forEach((question) => {
    question.responseSubmit = false;
    question.state = 'unattempt';
  })
  createMainPage();
}
const createMainPage = () => {
  $('<div>').attr('id', 'activityWrapper').appendTo('body');
  new ButtonClass({ text: 'START', events: onStartClick }).appendTo('#activityWrapper');
  $('#start').data().enable();
}

const onStartClick = () => {
  $('#activityWrapper').empty();
  createUI();
}
const createUI = () => {
  currentQue = qBank[currentpart];
  const $wrapper = $('<div>').attr('id', 'wrapper').appendTo('#activityWrapper');
  // question Number and Timer 
  const $assetsWrapper = $('<div>').attr('id', 'assetsWrapper').appendTo($wrapper)
  $('<div>').attr('id', 'currentQuestion').appendTo($assetsWrapper);
  $('<div>').attr('id', 'timer').appendTo($assetsWrapper).html('<span>05:00</span>');
  // ---------------------------------------------------------------------------------
  createTimer();
  // ---------------------------------------------------------------------------------
  // question
  const $questionWrapper = $('<div>').attr('id', 'questionWrapper').appendTo($wrapper);
  const $qHolder = $('<div>').attr('id', 'qholder').appendTo($questionWrapper);
  $('<div>').attr('id', 'questionText').appendTo($qHolder);

  // option
  const $answerHolder = $('<div>').attr('id', 'answerHolder').appendTo($questionWrapper);

  currentQue.optionArr.forEach((option, index) => {
    const $optionHolder = $('<div>').addClass('optionHolder').appendTo($answerHolder);
    $('<button>').addClass('option').attr('id', `option_${index}`).html(String.fromCodePoint(65 + index)).appendTo($optionHolder);
    $('<div>').addClass('choice').appendTo($optionHolder);
  })

  $('<div>').attr('id', 'line').appendTo($questionWrapper);
  const $navigationHolder = $('<div>').attr('id', 'navigationHolder').appendTo($wrapper);
  new ButtonClass({ text: 'PREV', events: onPreviousClick }).appendTo($navigationHolder);
  new ButtonClass({ text: 'NEXT', events: onNextClick }).appendTo($navigationHolder);
  new ButtonClass({ text: 'SUBMIT', events: onSubmitClick }).appendTo($navigationHolder);
  new ButtonClass({ text: 'FINISH', events: onFinishClick }).appendTo($navigationHolder);
  updatedata();
  buttonState();
  optionEvents();
}

const optionEvents = () => {
  $('.option').css('cursor', 'pointer').on('click', optionClick);
}

const optionClick = function () {
  $('.option').css('background', '');
  $(this).css('background', 'gray');
  $('#submit').data().enable();
  currentresponse = Number($(this).attr('id').split('_')[1]);
}

const updatedata = () => {
  currentQue = qBank[currentpart];
  $('.option').css('background', '');
  $('#submit').data().disable();
  $('#currentQuestion').html(`Question: ${currentpart + 1}/${qBank.length}`);
  $('#questionText').html(currentQue.question);
  $('.choice').each(function (i) {
    $(this).text(currentQue.optionArr[i])
  })
}

const onPreviousClick = () => {
  currentpart--;
  updatedata();
  buttonState();
}

const onNextClick = () => {
  currentpart++;
  updatedata();
  buttonState();
}

const onSubmitClick = () => {
  qBank[currentpart].responseSubmit = true;
  qBank[currentpart].state = qBank[currentpart].correct === currentresponse ? 'correct' : 'incorrect';
  if (currentpart < qBank.length - 1) {
    currentpart++;
    updatedata();
    buttonState();
  }
}

const onFinishClick = () => {
  $('#activityWrapper').empty();
  clearInterval(timerInterval)
  createResultUi();
}
const createResultUi = () => {
  const tempArr = qBank.map((ques) => ques.state);
  const countStateObj = {}
  tempArr.forEach((state) => {
    countStateObj[state] = (countStateObj[state] || 0) + 1;
  })
  const { correct = 0, incorrect = 0, unattempt = 0 } = countStateObj;
  const score = correct - 0.5 * incorrect;
  const percentage = score > 0 ? Math.round((score / qBank.length) * 100) : 0;
  const $scoreWrapper = $('<div>').attr('id', 'scoreWrapper').appendTo('#activityWrapper')
  $('<div>').attr('id', 'score').addClass('scoreCls').html(`You Scored:${score}`).appendTo($scoreWrapper);
  $('<div>').attr('id', 'correct').addClass('scoreCls').html(`Correct:${correct}`).appendTo($scoreWrapper);
  $('<div>').attr('id', 'incorrect').addClass('scoreCls').html(`Incorrect:${incorrect}`).appendTo($scoreWrapper);
  $('<div>').attr('id', 'skiped').addClass('scoreCls').html(`Skipped:${unattempt}`).appendTo($scoreWrapper);
  $('<div>').attr('id', 'percentage').addClass('scoreCls').html(`Percentage:${percentage}%`).appendTo($scoreWrapper);
}

const buttonState = () => {
  $('#finish').data().enable()
  currentpart ? $('#prev').data().enable() : $('#prev').data().disable();
  currentpart < qBank.length - 1 ? $('#next').data().enable() : $('#next').data().disable();
}

const createTimer = () => {
  const duaration = 5 * 60;
  const display = $('#timer');
  timer(duaration, display);
}

const timer = (duaration, display) => {
  let minutes, seconds;
  window.timerInterval = setInterval(() => {
    if (--duaration < 0) {
      display.textContent = '00:00';
      onFinishClick();
      return;
    }
    minutes = parseInt(duaration / 60, 10);
    seconds = parseInt(duaration % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.html(`<span>${minutes}:${seconds}</span>`);
  }, 1000)
}

const isFunction = (fn) => typeof fn === 'function';

const isNumber = (n) => typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n) && n > 0;

const isObject = (obj) => typeof obj === 'object' && !Array.isArray(obj) && obj !== null;

const isBoolean = (bool) => typeof bool === 'boolean';

class ButtonClass {
  constructor(config) {
    config = isObject(config) ? config : {};
    config.borderColor = config.borderColor ? config.borderColor : 'rgba(0,0,0,1)';
    config.fillColor = config.fillColor ? config.fillColor : 'rgba(39, 135, 176,1)';
    config.textColor = config.textColor ? config.textColor : 'rgba(255,255,255,1)';
    config.text = config.text ? config.text : '';
    this.events = isFunction(config.events) ? config.events : () => { };
    this.isEnabled = isBoolean(config.isEnabled) ? config.isEnabled : true;
    this.isSelected = isBoolean(config.isSelected) ? config.isSelected : false;
    return this.createButton(config);
  }

  createButton(config) {
    const $element = $('<button>').attr('id', config.text.toLowerCase()).addClass('htmlbutton').css({
      background: config.fillColor,
      border: `2px solid ${config.borderColor}`,
      color: config.textColor
    })
    $('<span>').html(config.text).appendTo($element);

    $element.data({
      isEnabled: () => {
        return this.isEnabled;
      },

      enable: () => {
        this.isEnabled = true;

        $element.css({
          cursor: 'pointer',
          opacity: 1
        })[0].removeAttribute('disabled');

        return $element.data();
      },

      disable: () => {
        this.isEnabled = false;

        $element.css({
          cursor: 'default',
          opacity: 0.5
        })[0].setAttribute('disabled', '');

        return $element.data();
      },

      response: (id) => {
        return id;
      }
    })

    const onClick = (e) => {
      if (!this.isEnabled) return;
      this.events('click', e, $element)
    }

    $element.on('click', onClick);

    return $element;
  }
}