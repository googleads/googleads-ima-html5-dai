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

var STREAM_EVENT_URL = 'streamevent.xml';

// More info here:
// https://developer.hbbtv.org/tutorials/handling-the-broadcast-av-object/
var UNREALIZED_PLAYSTATE = 0;
var CONNECTING_PLAYSTATE = 1;
var PRESENTING_PLAYSTATE = 2;
var STOPPED_PLAYSTATE = 3;

// Ad break events
var AD_BREAK_EVENT_ANNOUNCE = 'adBreakAnnounce';
var AD_BREAK_EVENT_START = 'adBreakStart';
var AD_BREAK_EVENT_END = 'adBreakEnd';

// Pod manifest request inputs. Add your own test values.
var NETWORK_CODE = '';
var CUSTOM_ASSET_KEY = '';

var app = null;
var debugView = null;

// [START create_app]
/** Main HbbTV Application. */
var HbbTVApp = function() {
  this.broadcastAppManager = document.getElementById('broadcast-app-manager');
  this.broadcastContainer = document.getElementById('broadcast-video');

  this.playState = -1; // -1 as null play state.

  try {
    this.applicationManager =
        this.broadcastAppManager.getOwnerApplication(document);
    this.applicationManager.show();
    this.broadcastContainer.bindToCurrentChannel();
    this.subscribedToStreamEvents = false;
    this.broadcastContainer.addEventListener(
        'PlayStateChange', this.onPlayStateChangeEvent.bind(this));

    debugView.log('HbbTVApp: App loaded');
    this.videoPlayer = new VideoPlayer();
    this.videoPlayer.setOnAdPodEnded(this.resumeBroadcast.bind(this));
  } catch (e) {
    debugView.log('HbbTVApp: No HbbTV device detected.');
    return;
  }

  this.adManager = new AdManager(this.videoPlayer);
};
// [END create_app]

/**
 * Listen to play state change events
 */
HbbTVApp.prototype.onPlayStateChangeEvent = function() {
  var playStateString =
      this.getBroadcastState(this.broadcastContainer.playState);
  debugView.log('onPlayStateChangeEvent event: ' + playStateString);
  // [START app_presenting_playstate_change]
  if (!this.subscribedToStreamEvents &&
      this.broadcastContainer.playState == PRESENTING_PLAYSTATE) {
    this.subscribedToStreamEvents = true;
    this.broadcastContainer.addStreamEventListener(
        STREAM_EVENT_URL, 'eventItem', function(event) {
          this.onStreamEvent(event);
        }.bind(this));
    debugView.log('HbbTVApp: Subscribing to stream events.');
    this.adManager.requestStream(NETWORK_CODE, CUSTOM_ASSET_KEY);
  }
  // [END app_presenting_playstate_change]

  if (this.playState != this.broadcastContainer.playState) {
    debugView.log('onPlayStateChange event: ' + playStateString);
    this.playState = this.broadcastContainer.playState;
  }
};

// [START app_stream_event]
/**
 * Callback for HbbTV stream event.
 * @param {!Event} event Stream event payload.
 */
HbbTVApp.prototype.onStreamEvent = function(event) {
  var eventData = JSON.parse(event.text);
  var eventType = eventData.type;
  if (eventType == AD_BREAK_EVENT_ANNOUNCE) {
    this.onAdBreakAnnounce(eventData);
  } else if (eventType == AD_BREAK_EVENT_START) {
    this.onAdBreakStart(eventData);
  } else if (eventType == AD_BREAK_EVENT_END) {
    this.onAdBreakEnd(eventData);
  }
};
// [END app_stream_event]

/**
 * Returns current broadcast state.
 * @return {string} broadcast state.
 */
HbbTVApp.prototype.getBroadcastState = function() {
  var currentState = '';

  switch (this.broadcastContainer.playState) {
    case UNREALIZED_PLAYSTATE:
      currentState = 'Unrealized';
      break;
    case CONNECTING_PLAYSTATE:
      currentState = 'Connecting';
      break;
    case PRESENTING_PLAYSTATE:
      currentState = 'Presenting';
      break;
    case STOPPED_PLAYSTATE:
      currentState = 'Stopped';
      break;
    default:
      currentState = 'Error';
  }
  return currentState;
};

// [START app_ad_break_announce]
/**
 * Callback function on ad break announce stream event.
 * @param {!Event} event HbbTV stream event payload.
 */
HbbTVApp.prototype.onAdBreakAnnounce = function(event) {
  var eventType = event.type;
  var eventDuration = event.duration;
  var eventOffset = event.offset;
  debugView.log(
      'HbbTV event: ' + eventType + ' duration: ' + eventDuration +
      's offset: ' + eventOffset + 's');
  this.adManager.loadAdPodManifest(NETWORK_CODE, CUSTOM_ASSET_KEY, eventDuration);
};
// [END app_ad_break_announce]

// [START app_ad_break_start]
/**
 * Callback function on ad break start stream event.
 * @param {!Event} event HbbTV stream event payload.
 */
HbbTVApp.prototype.onAdBreakStart = function(event) {
  debugView.log('HbbTV event: ' + event.type);
  if (!this.videoPlayer.isPreloaded()) {
    debugView.log('HbbTVApp: Switch aborted. ' +
                  'The ad preloading buffer is insufficient.');
    return;
  }
  this.stopBroadcast();
  this.videoPlayer.play();
};
// [END app_ad_break_start]

// [START app_ad_break_end]
/**
 * Callback function on ad break end stream event.
 * @param {!Event} event HbbTV stream event payload.
 */
HbbTVApp.prototype.onAdBreakEnd = function(event) {
  debugView.log('HbbTV event: ' + event.type);
  this.videoPlayer.stop();
  this.resumeBroadcast();
};
// [END app_ad_break_end]

/** Starts broadcast stream. */
HbbTVApp.prototype.resumeBroadcast = function() {
  this.broadcastContainer.style.display = 'block';
  try {
    debugView.log('HbbTVApp: Resuming broadcast');
    this.broadcastContainer.bindToCurrentChannel();
  } catch (e) {
    debugView.log('HbbTVApp: Could not resume broadcast stream');
  }
};

/** Stops broadcast stream. */
HbbTVApp.prototype.stopBroadcast = function() {
  this.broadcastContainer.style.display = 'none';
  try {
    debugView.log('HbbTVApp: Stopping broadcast');
    this.broadcastContainer.stop();
  } catch (e) {
    debugView.log('HbbTVApp: Could not stop broadcast stream');
  }
};

/** Debug console to prompt console log visibly on the screen. */
var DebugConsole = function() {
  this.debugConsole = document.getElementById('console');
};

/**
 * Prompts debug message on the screen.
 * @param {string} message
 */
DebugConsole.prototype.log = function(message) {
  console.log(message);
  if (this.debugConsole) {
    var line = this.getTime() + ' ' + message;
    this.debugConsole.innerHTML = line + '<br/>' + this.debugConsole.innerHTML;
  }
};

/**
 * Prompts error message on the screen.
 * @param {string} message
 */
DebugConsole.prototype.error = function(message) {
  if (this.debugConsole) {
    var line = '<span class="error">' + this.getTime() + ' ' + message +
        '</span><br/>';
    this.debugConsole.innerHTML = line + this.debugConsole.innerHTML;
  }
};

/**
 * Prompts error message on the screen.
 * @return {string} current timestamp.
 */
DebugConsole.prototype.getTime = function() {
  var d = new Date();
  return ('0' + d.getHours()).slice(-2) + ':' +
      ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
};

/**
 * Redirects console log error message to debug console.
 */
window.onerror = function(message, source, lineNumber) {
  console.error(message, source, lineNumber);
  debugView.error(message + ' (' + lineNumber + ')');
};

document.addEventListener('DOMContentLoaded', function() {
  debugView = new DebugConsole();
  app = new HbbTVApp();
});
