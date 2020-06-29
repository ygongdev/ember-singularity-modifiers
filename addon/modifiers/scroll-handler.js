import Modifier from 'ember-modifier';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
/**
 * The scroll-handler mixin adds an easy-to-use "scroll" hook, similar to the
 * default Ember hook for click(). It is only applicable to views/components.
 */

const SCROLL = 'scroll';
const EVENTTARGET = 'eventTarget';
const WINDOW = 'window';

export default class ScrollModifier extends Modifier {
  @service('unified-event-handler') unifiedEventHandler

  // The target of the scrolling event, defaults to the window
  [EVENTTARGET] =  WINDOW

  // The hook for your scroll functionality, you must implement this
  [SCROLL] = undefined

  // Interval in milliseconds at which the scroll handler will be called
  // `undefined` by default, can be overridden if custom interval is needed
  scrollEventInterval = undefined

  // Whether to trigger the scroll handler on initial insert
  triggerOnInsert = false

  didInstall() {
    this._registerScrollHandlers();
  }

  willDestroy() {
    this._unregisterScrollHandlers();
  }

  // Setups up the handler binding for the scroll function
  _registerScrollHandlers() {
    // TODO: limit this to the views object (this.$()) or the window
    let eventTarget = this.EVENTTARGET;

    // Bind 'this' context to the scroll handler for when passed as a callback
    let scroll = this.SCROLL.bind(this);

    // Save the newly bound function back as a reference for deregistration.
    this.SCROLL = scroll;

    this.unifiedEventHandler.register(eventTarget, SCROLL, scroll, this.scrollEventInterval);

    this._scrollHandlerRegistered = true;

    if (this.triggerOnInsert) {
      scheduleOnce('afterRender', scroll);
    }
  }

  // Unbinds the event handler on destruction of the view
  _unregisterScrollHandlers() {
    if (this._scrollHandlerRegistered) {
      let scroll = this.SCROLL;
      let eventTarget = this.EVENTTARGET;
      this.unifiedEventHandler.unregister(eventTarget, SCROLL, scroll);
      this._scrollHandlerRegistered = false;
    }
  }
};
