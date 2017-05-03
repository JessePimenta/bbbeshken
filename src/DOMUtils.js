export default class DOMUtils {
  static hasClass(el, className) {
    if (el.classList)
      return el.classList.contains(className);
    else
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
  }

  static addClass(el, className) {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  }

  static removeClass(el, className) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }

  static addMultiEventListener(el, eventsString, fn) {
    eventsString.split(' ').forEach(e => el.addEventListener(e, fn, false));
  }

  static removeMultiEventListener(el, eventsString, fn) {
    eventsString.split(' ').forEach(e => el.removeEventListener(e, fn));
  }
}
