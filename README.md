# videojs-s3bubble-mediatailor

Mediatailor

## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->
## Installation

```sh
npm install --save videojs-s3bubble-mediatailor
```

## Usage

To include videojs-s3bubble-mediatailor on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-s3bubble-mediatailor.min.js"></script>
<script>
  var player = videojs('my-video');

  player.s3BubbleMediatailor();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-s3bubble-mediatailor via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-s3bubble-mediatailor');

var player = videojs('my-video');

player.s3BubbleMediatailor();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-s3bubble-mediatailor'], function(videojs) {
  var player = videojs('my-video');

  player.s3BubbleMediatailor();
});
```

## License

MIT. Copyright (c) S3bubble &lt;support@s3bubble.com&gt;


[videojs]: http://videojs.com/
