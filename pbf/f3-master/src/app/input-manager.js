export default class EventManager {
  constructor() {
    this.mouse = {
      x: 0,
      y: 0
    };
    this.keys = new Set();

    this.handlers = {};
    
    this.on_click = this.on_click.bind(this);
    this.on_mouse = this.on_mouse.bind(this);
    this.on_scroll = this.on_scroll.bind(this);

    this.init();
  }

  init() {
    window.addEventListener('mousemove', this.on_mouse);
  }

  destroy() {
    window.removeEventListener('mousemove', this.on_mouse);
  }

  emit(event, payload) {
    if (!this.handlers[event])
      return;

    this.handlers[event].forEach(h => h(this, payload));
  }

  on(event, handler) {
    if (!this.handlers[event])
      this.handlers[event] = [];

    this.handlers[event].push(handler);    
  }

  remove(event, handler) {
    if (!this.handlers[event])
      return;

    this.handlers[event] = this.handlers[event].filter(h => h !== handler);
  }

  on_click() {

  }

  on_mouse(e) {
    this.mouse.x = e.offsetX;
    this.mouse.y = e.offsetY;

    this.handlers['mousemove'].forEach(h => h(this, e));
  }

  on_scroll() {

  }
}