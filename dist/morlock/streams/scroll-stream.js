define("morlock/streams/scroll-stream", 
  ["morlock/core/stream","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Stream = __dependency1__;

    /**
     * Create a new Stream containing scroll events.
     * These events can be debounced (meaning they will only emit after events have
     * ceased for X milliseconds).
     * @param {object=} options Map of optional parameters.
     * @param {number=200} options.debounceMs What rate to debounce the stream.
     * @return {Stream} The resulting stream.
     */
    function create(options) {
      options = options || {};
      var debounceMs = 'undefined' !== typeof options.debounceMs ? options.debounceMs : 200;

      var scrollEndStream = Stream.debounce(
        debounceMs,
        createFromEvents()
      );

      // It's going to space, will you just give it a second!
      setTimeout(function() {
        var evObj = document.createEvent('HTMLEvents');
        evObj.initEvent( 'scroll', true, true );
        window.dispatchEvent(evObj);
      }, 10);

      return scrollEndStream;
    }

    function createFromEvents() {
      var oldScrollY;
      var scrollDirty = true;

      Stream.onValue(Stream.createFromEvents(window, 'scroll'), function() {
        scrollDirty = true;
      });

      var rAF = Stream.createFromRAF();

      var didChangeOnRAFStream = Stream.filter(function() {
        if (!scrollDirty) { return false; }
        scrollDirty = false;

        var newScrollY = window.scrollY;
        if (oldScrollY !== newScrollY) {
          oldScrollY = newScrollY;
          return true;
        }

        return false;
      }, rAF);

      return Stream.map(
        function getWindowPosition() {
          return oldScrollY;
        },
        didChangeOnRAFStream
      );
    }

    __exports__.create = create;
  });