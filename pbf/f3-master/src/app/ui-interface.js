export default app => class InfoBox {
  constructor() {
    const div = document.createElement('div');
    div.setAttribute('id', 'info-box');

    div.style.position = 'fixed';
    div.style.top = 0;
    div.style.left = 0;
    div.style.border = '1px solid white';
    div.style.color = 'white';
    div.style.padding = '0.4em';
    div.style.fontSize = '0.8em';

    document.body.appendChild(div);

    const pause_button = document.createElement('button');
    pause_button.innerHTML = 'start';
    pause_button.setAttribute('id', 'pause');
    div.appendChild(pause_button);

    const reset_button = document.createElement('button');
    reset_button.innerHTML = 'reset';
    reset_button.setAttribute('id', 'reset');
    div.appendChild(reset_button);

    const info = document.createElement('div');
    div.appendChild(info);

    this.div = div;
    this.pause_button = pause_button;
    this.info_elem = info;
    this._info = {};

    this.on_pause = this.on_pause.bind(this);
    pause_button.addEventListener('click', this.on_pause);

    this.on_reset = this.on_reset.bind(this);
    reset_button.addEventListener('click', this.on_reset)
  }

  on_pause() {
    if (app.paused) {
      this.pause_button.innerHTML = 'pause';
      app.run();
    } else {
      this.pause_button.innerHTML = 'resume';
      app.pause();
    }
  }

  sync() {
    if (app.paused)
      this.pause_button.innerHTML = 'resume';
    else
      this.pause_button.innerHTML = 'pause';
  }

  on_reset() {
    !app.reset_pending && app.reset();
  }

  get info() {
    return this._info;
  }

  set info(i) {
    this._info = i;
    this.info_elem.innerHTML = `<pre>${JSON.stringify(i, null, 2)}</pre>`;
  }
}
