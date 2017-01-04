class Codevember {

  init() {
    this.minDate = 1;
    this.maxDate = 30;

    const location = window.location.hash;

    if (location.length === 0) {
      this.dateIndex = this.minDate;
    } else {
      this.dateIndex = this.getDate(location);
    }

    this.iframeRef = document.querySelector('iframe');

    // Fix for growing iframe on ios!
    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
      this.iframeRef.style.width = getComputedStyle(this.iframeRef).width;
      this.iframeRef.style.height = getComputedStyle(this.iframeRef).height;
      this.iframeRef.setAttribute('scrolling', 'no');
    }

    this.textLabel = document.querySelector('#ui span');

    // Init the buttons
    Array.from(document.querySelectorAll('button')).map((button) => {
      button.addEventListener('click', this.handleButtonClick.bind(this), false);
      return true;
    });

    // Load day
    this.loadSource(this.dateIndex);
  }

  getDate(location) {
    // console.log('Main.js', 'getDate', location);

    const index = location.indexOf('#');
    let returnValue;

    if (index > -1) {
      const regex = /\d+/;
      const number = location.match(regex)[0];

      if (number >= this.minDate && number <= this.maxDate) {
        returnValue = parseInt(number, 10);
      } else {
        returnValue = this.minDate;
      }
    } else {
      returnValue = this.minDate;
    }

    return returnValue;
  }


  handleButtonClick(event) {
    if (event.target.classList.contains('left')) {
      this.dateIndex = (this.dateIndex > this.minDate) ? this.dateIndex -= 1 : this.maxDate;
    } else {
      this.dateIndex = (this.dateIndex < this.maxDate) ? this.dateIndex += 1 : this.minDate;
    }

    this.loadSource(this.dateIndex);
  }

  loadSource(index) {
    let path;

    if (index < 10) {
      path = `./0${index}/`;
    } else {
      path = `./${index}/`;
    }

    this.iframeRef.src = path;

    this.textLabel.textContent = `November ${index}`;

    window.location.hash = `${index}`;
  }
}

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    const codevember = new Codevember();
    codevember.init();
  }
};
