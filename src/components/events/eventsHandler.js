import toastr from 'toastr';

//toastr.options.preventDuplicates = true;

let store = null;
export class EventsHandler {
  static setStore(s) {
    store = s;
  }

  static dispatch(event) {
    if (event && event.info) {
      toastr.info(JSON.stringify(event.info));
      store.dispatch({type: 'events/NEW', event: event});
    }
  }
}
