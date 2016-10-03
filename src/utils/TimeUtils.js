
export default class TimeUtils {
  static format(dt) {
    let type = typeof dt;
    let date = dt;
    if (type === "string") {
      //possible here we must do addition work for parse string
      date = new Date(dt);
    }
    if (type === "number") {
      date = new Date(dt);
    }
    if(!date) {
      return null;
    }
    return date.toLocaleString();
  }
}
