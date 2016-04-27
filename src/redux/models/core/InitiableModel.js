export class InitableModel {
  /* every descender class should (if want to defined default values) contain constructor and super call to this method,
   either case property  DEFAULT values in that class will be applied after this constructor call
   */
  constructor({init = {}}) {
    this.initializeByConfig(init);
  }

  initializeByConfig(init) {
    Object.keys(init).forEach((property) => {
      this[property] = init[property];
    });
  }
}
