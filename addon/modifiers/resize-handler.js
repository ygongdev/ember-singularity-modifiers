import Modifier from 'ember-modifier';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';

/**
 * The resize-handler modifier uses an easy-to-use "resize" hook, similar to the
 * default Ember hook for click(). It is only applicable to views/components.
 */
const RESIZE = 'resize';

export default class ResizeModifier extends Modifier {
  @service('unified-event-handler') unifiedEventHandler

  // The hook for your resize functionality, you must implement this
  [RESIZE] = undefined

  // Determines if we should fire a resize event on element insertion
  resizeOnInsert = true

    // Interval in milliseconds at which the resize handler will be called
  // `undefined` by default, can be overridden if custom interval is needed
  resizeEventInterva = undefined

  didInstall() {
    this._registerResizeHandlers();
  }

  willRemove() {
    this._unregisterResizeHandlers();
  }

  // Setups up the handler binding for the resize function
  _registerResizeHandlers() {
    // Bind 'this' context to the resize handler for when passed as a callback
    let resize = this.RESIZE.bind(this);
    this.RESIZE = resize;

    this.unifiedEventHandler.register('window', RESIZE, resize, this.resizeEventInterval);

    this._resizeHandlerRegistered = true;

    if (this.resizeOnInsert) {
      // Call the resize handler to make sure everything is in the correct state.
      // We do it after the current render, to avoid any side-effects.
      scheduleOnce('afterRender', this, () => {
        resize();
      });
    }
  }

  // Unbinds the event handler on destruction of the view
  _unregisterResizeHandlers() {
    if (this._resizeHandlerRegistered) {
      let resize = this.RESIZE;
      this.unifiedEventHandler.unregister('window', RESIZE, resize);
      this._resizeHandlerRegistered = false;
    }
  }
}
