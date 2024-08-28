/*
 Copyright 2024 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var SCHEME_ID_URI = 'https://developer.apple.com/streaming/emsg-id3';

// Ads will only play with 10 or more seconds of ad loaded.
var MIN_BUFFER_THRESHOLD = 10;

/**
 * Video player wrapper class to control ad creative playback with dashjs in
 * broadband.
 */
var VideoPlayer = function() {
  this.videoElement = document.querySelector('video');
  this.broadbandWrapper = document.getElementById('broadband-wrapper');
  this.player = dashjs.MediaPlayer().create();
  this.onAdPodEndedCallback;

  // Function passed in VideoPlayer.prototype.setEmsgEventHandler.
  this.onCustomEventHandler;
  //  Scope (this) passed in VideoPlayer.prototype.setEmsgEventHandler.
  this.customEventHandlerScope;

  // Function to remove all of player event listeners.
  this.playerListenerCleanup;
  debugView.log('Player: Initializing dashjs');
};

/** Starts playback of ad stream. */
VideoPlayer.prototype.play = function() {
  debugView.log('Player: Start playback');
  this.show();
  this.player.attachView(this.videoElement);
};

/** Stops ad stream playback and deconstructs player. */
VideoPlayer.prototype.stop = function() {
  debugView.log('Player: Request to stop player');
  if (this.playerListenerCleanup) {
    this.playerListenerCleanup();
  }
  this.player.reset();
  this.player.attachView(null);
  this.player.attachSource(null);
  this.player = null;
  this.hide();
};

/**
 * Sets a callback function for when an ad pod has ended.
 * @param {!Function} callback Callback function.
 */
VideoPlayer.prototype.setOnAdPodEnded = function(callback) {
  this.onAdPodEndedCallback = callback;
};

/**
 * Starts ad stream prefetching into Media Source Extensions (MSE) buffer.
 * @param {string} url manifest url for ad stream playback.
 */
VideoPlayer.prototype.preload = function(url) {
  if (!this.player) {
    this.player = dashjs.MediaPlayer().create();
  }
  debugView.log('Player: init with ' + url);
  this.player.initialize(/* HTMLVideoElement */ null, url, /* autoplay */ true);

  this.player.updateSettings({
    'debug': {
      'logLevel': dashjs.Debug.LOG_LEVEL_WARNING,
      'dispatchEvent': true,  // flip to false to hide all debug events.
    },
    'streaming': {
      'cacheInitSegments': true,
    }
  });
  this.player.preload();
  this.attachPlayerListener();
  debugView.log('Player: Pre-loading into MSE buffer');
};

/**
 * Controls the dashjs player's own logging in the debugging console.
 * @param {!Object} event dashjs log event.
 */
VideoPlayer.prototype.onLog = function(event) {
  if (event.level < 4) {
    debugView.log(event.message);
  }
};

/** Attaches event listener for various dashjs events.*/
VideoPlayer.prototype.attachPlayerListener = function() {
  var playingHandler = function() {
    this.onAdPodPlaying();
  }.bind(this);
  this.player.on(dashjs.MediaPlayer.events['PLAYBACK_PLAYING'], playingHandler);
  var endedHandler = function() {
    this.onAdPodEnded();
  }.bind(this);
  this.player.on(dashjs.MediaPlayer.events['PLAYBACK_ENDED'], endedHandler);
  var logHandler = function(e) {
    this.onLog(e);
  }.bind(this);
  this.player.on(dashjs.MediaPlayer.events['LOG'], logHandler);
  var errorHandler = function(e) {
    this.onAdPodError(e);
  }.bind(this);
  this.player.on(dashjs.MediaPlayer.events['ERROR'], errorHandler);

  var customEventHandler = null;
  if (this.onCustomEventHandler) {
    customEventHandler =
        this.onCustomEventHandler.bind(this.customEventHandlerScope);
    this.player.on(SCHEME_ID_URI, customEventHandler);
  }

  this.playerListenerCleanup = function() {
    this.player.off(
        dashjs.MediaPlayer.events['PLAYBACK_PLAYING'], playingHandler);
    this.player.off(dashjs.MediaPlayer.events['PLAYBACK_ENDED'], endedHandler);
    this.player.off(dashjs.MediaPlayer.events['LOG'], logHandler);
    this.player.off(dashjs.MediaPlayer.events['ERROR'], errorHandler);
    if (customEventHandler) {
      this.player.off(SCHEME_ID_URI, customEventHandler);
    }
  };
};

/**
 * Sets emsg event handler.
 * @param {!Function} customEventHandler Event handler.
 * @param {!Object} scope JS scope in which event handler function is called.
 */
VideoPlayer.prototype.setEmsgEventHandler = function(
    customEventHandler, scope) {
  this.onCustomEventHandler = customEventHandler;
  this.customEventHandlerScope = scope;
};

/**
 * Called when ad stream playback buffered and is playing.
 */
VideoPlayer.prototype.onAdPodPlaying = function() {
  debugView.log('Player: Ad Playback started');
};

/**
 * Called when ad stream playback has been completed.
 * Will call the restart of broadcast stream.
 */
VideoPlayer.prototype.onAdPodEnded = function() {
  debugView.log('Player: Ad Playback ended');
  this.stop();
  if (this.onAdPodEndedCallback) {
    this.onAdPodEndedCallback();
  }
};

/**
 * @param {!Event} event The error event to handle.
 */
VideoPlayer.prototype.onAdPodError = function(event) {
  debugView.log('Player: Ad Playback error from dashjs player.');
  this.stop();
  if (this.onAdPodEndedCallback) {
    this.onAdPodEndedCallback();
  }
};

/** Shows the video player. */
VideoPlayer.prototype.show = function() {
  debugView.log('Player: show');
  this.broadbandWrapper.style.display = 'block';
};

/** Hides the video player. */
VideoPlayer.prototype.hide = function() {
  debugView.log('Player: hide');
  this.broadbandWrapper.style.display = 'none';
};

/**
 * Checks if the ad is preloaded and ready to play.
 * @return {boolean} whether the ad buffer level is sufficient.
 */
VideoPlayer.prototype.isPreloaded = function() {
  var currentBufferLevel = this.player.getDashMetrics()
      .getCurrentBufferLevel('video', true);
  return currentBufferLevel >= MIN_BUFFER_THRESHOLD;
};