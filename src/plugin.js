import videojs from 'video.js';
import { version as VERSION } from '../package.json';
import './middleware';

const Plugin = videojs.getPlugin('plugin');
const Component = videojs.getComponent('Component');

// Default options for the plugin.
const defaults = {
  now: null,
  then: Date.now(),
  interval: 1000,
  delta: null,
  currentTime: 0,
  countDown: 0,
  currentAd: null,
  trackingUrl: null,
  src: null,
  isSeek: true,
  adIsPlaying: false,
  played: [],
  adPositions: []
};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class S3BubbleMediatailor extends Plugin {

  /**
   * Create a S3BubbleMediatailor plugin instance.
   *
   * @param  {Player} player
   *         A Video.js Player instance.
   *
   * @param  {Object} [options]
   *         An optional options object.
   *
   *         While not a core part of the Video.js plugin architecture, a
   *         second argument of options is a convenient way to accept inputs
   *         from your plugin's caller.
   */
  constructor(player, options) {
    // the parent class will add player under this.player
    super(player);

    this.options = videojs.mergeOptions(defaults, options);

    this.player.ready(() => {
      this.player.addClass('vjs-s3bubble-mediatailor');
    });
    this.player.on('loadstart', (_event) => {
      this.player.one("loadedmetadata", () => {
        if (this.player.currentSource().tracking) {
          this.player.markers({
            markerStyle: {
              "background-color": "#fbcf03",
              "border-radius": "0px",
              "z-index": "0",
              "pointer-events": "none"
            },
            onMarkerReached: function(marker) { },
            markers: [],
          });
          this.options.trackingUrl = this.player.currentSource().tracking;
          this.startTracking();
          this.buildUi();
          this.player.on('timeupdate', this.ssaiTime.bind(this, 'timeupdate'));
          this.player.on('playing', this.ssaiPlay.bind(this, 'playing'));
          this.player.on('seeking', this.ssaiSeeking.bind(this, 'seeking'));
          this.player.on('seeked', this.ssaiSeeked.bind(this, 'seeked'));
        }
      });
    });
  }

  ssaiPlay() {
    setTimeout(() => {
      this.options.isSeek = true;
    }, 2000);
  }

  ssaiSeeking() {
    if (this.options.currentTime < this.player.currentTime() && this.options.adIsPlaying) {
      this.player.currentTime(this.options.currentTime);
    }
  }

  ssaiSeeked() {
    if (this.options.isSeek && !this.options.adIsPlaying) {
      let seeked = this.player.currentTime();
      let goSeek = this.findClosest(seeked, this.options.adPositions);
      if (goSeek && !this.options.played.includes(goSeek.availId)) {
        this.player.currentTime(goSeek.start);
        this.options.played.push(goSeek.availId);
        this.options.isSeek = false;
      }
    }

  }

  ssaiTime() {
    this.options.now = Date.now();
    this.options.delta = this.options.now - this.options.then;

    if (this.options.delta > this.options.interval) {

      this.options.then = this.options.now - (this.options.delta % this.options.interval);
      if (!this.player.paused()) {
        this.options.currentTime = this.player.currentTime();
        let ind = this.options.adPositions.findIndex(
          (x) => this.options.currentTime >= x.start && this.options.currentTime <= x.end
        );
        if (ind !== -1) {

          if (!this.options.played.includes(this.options.adPositions[ind].availId)) {
            this.options.played.push(this.options.adPositions[ind].availId);
          }

          let count = Math.round(this.options.adPositions[ind].end) - Math.round(this.options.adPositions[ind].start) - this.options.countDown;
          let adCount = this.options.adPositions[ind].data.ads.length > 1 ? 's' : '';
          this.player.getChild('adBox').addClass('animated');
          this.player.getChild('adBox').updateTextContent(`${this.options.adPositions[ind].data.ads.length} Ad${adCount} ${Math.abs(count)}s`);

          this.options.adIsPlaying = true;
          if (this.options.countDown < 0) {
            this.player.getChild('adBox').removeClass('animated');
          } else {
            this.options.countDown++;
          }
          //this.player.controlBar.progressControl.el().style.pointerEvents = "none";
        } else {
          this.player.getChild('adBox').removeClass('animated');
          this.options.countDown = 0;
          this.options.adIsPlaying = false;
          //this.player.controlBar.progressControl.el().style.pointerEvents = "unset";
        }
      }

    }

  }

  findClosest(x, arr) {
    var filteredArray = arr.filter(function(ad) {
      return x > ad.end;
    });
    return filteredArray[filteredArray.length - 1];
  }

  startTracking() {
    videojs.xhr.get(this.options.trackingUrl, (err, resp) => {
      const data = JSON.parse(resp.body);
      let markers = [];
      data.avails.forEach((element) => {
        this.options.adPositions.push({
          data: element,
          availId: element.availId,
          start: element.startTimeInSeconds,
          end:
            element.startTimeInSeconds + element.durationInSeconds,
        });
        markers.push({
          availId: element.availId,
          time: element.startTimeInSeconds,
          duration: element.durationInSeconds,
          text: "Ads",
        });
      });
      this.player.markers.reset(markers);
    });
  }

  buildUi() {

    const adBox = videojs.extend(Component, {
      constructor: function(player, options) {
        Component.apply(this, arguments);
        if (options.text) {
          this.updateTextContent(options.text);
        }
      },
      createEl: function() {
        return videojs.createEl('div', {
          className: 'vjs-ad-box'
        });
      },
      updateTextContent: function(text) {
        if (typeof text !== 'string') {
          text = '';
        }
        videojs.emptyEl(this.el());
        videojs.appendContent(this.el(), text);
      }
    });
    videojs.registerComponent('adBox', adBox);
    this.player.addChild('adBox', { text: '' });
  }
}

// Define default values for the plugin's `state` object here.
S3BubbleMediatailor.defaultState = {};

// Include the version number.
S3BubbleMediatailor.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('s3BubbleMediatailor', S3BubbleMediatailor);

export default S3BubbleMediatailor;
