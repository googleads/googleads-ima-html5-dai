let adPlaying = false;
let hls;
let streamManager;

const pmElement = document.getElementById('playbackMethod');

const streamUrl = document.getElementById('stream-manifest');
const netcode = document.getElementById('network-code');
const assetkey = document.getElementById('custom-asset-key');
const apikey = document.getElementById('api-key');
const requestButton = document.getElementById('request-pod');

const adUiElement = document.getElementById('video-ad-ui');
const videoElement = document.getElementById('video');

/**
 * begin processing JavaScript
 */
function init() {
  logText('Initializing');
  if (useNativePlayer()) {
    pmElement.textContent = 'Native Player';
  } else {
    pmElement.textContent = 'HLS.js';
  }

  requestButton.onclick = (e) => {
    e.preventDefault();
    if (!netcode.value || !assetkey.value || !streamUrl.value) {
      logText('ERROR: Network Code, Asset Key, and Stream URL are required');
      setStatus('Error');
      return;
    }
    logText('Requesting PodServing Stream');
    requestPodStream(netcode.value, assetkey.value, apikey.value);
  };
}

/**
 * Check browser for HLS support
 * @return {boolean} is the browser safari.
 */
function useNativePlayer() {
  // this could be a more advanced check, but instead is a trivial navigator
  return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent && navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1;
}

/**
 * Request the pod stream from Google.
 * @param {string} networkCode - the network code.
 * @param {string} customAssetKey - the asset key.
 * @param {string} apiKey - the api key (optional).
 */
function requestPodStream(networkCode, customAssetKey, apiKey) {
  // generate a stream manager, on first request
  if (!streamManager) {
    streamManager =
        new google.ima.dai.api.StreamManager(videoElement, adUiElement);
    // Add event listeners
    streamManager.addEventListener(
        [
          google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED,
          google.ima.dai.api.StreamEvent.Type.ERROR,
          google.ima.dai.api.StreamEvent.Type.CLICK,
          google.ima.dai.api.StreamEvent.Type.STARTED,
          google.ima.dai.api.StreamEvent.Type.FIRST_QUARTILE,
          google.ima.dai.api.StreamEvent.Type.MIDPOINT,
          google.ima.dai.api.StreamEvent.Type.THIRD_QUARTILE,
          google.ima.dai.api.StreamEvent.Type.COMPLETE,
          google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
          google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED,
          google.ima.dai.api.StreamEvent.Type.AD_PROGRESS,
          google.ima.dai.api.StreamEvent.Type.PAUSED,
          google.ima.dai.api.StreamEvent.Type.RESUMED
        ],
        onStreamEvent, false);
  }
  // clear HLS.js instance, if in use
  if (hls) {
    hls.destroy();
  }

  // Generate a PodServing Stream Request
  const streamRequest = new google.ima.dai.api.PodStreamRequest();
  streamRequest.networkCode = networkCode;
  streamRequest.customAssetKey = customAssetKey;
  streamRequest.apiKey = apiKey;
  streamManager.requestStream(streamRequest);
}

/**
 * Handle stream events
 * @param {!Event} e - the event object
 */
function onStreamEvent(e) {
  switch (e.type) {
    // Once PodServing stream is initialized, build request
    // for the video stream, including the podserving stream id
    case google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED:
      const streamId = e.getStreamData().streamId;
      logText('Stream initialized: ' + streamId);
      const url = buildStreamURL(streamId);
      loadStream(url);
      break;
    // Log Errors
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      setStatus('Error');
      logText('ERROR: ' + e.getStreamData().errorMessage);
      break;
    // Hide video controls while ad is playing
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      logText('Ad Break Started');
      adPlaying = true;
      hideControls();
      setStatus('Playing ads');
      break;
    // show video controls when ad ends
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      logText('Ad Break Ended');
      adPlaying = false;
      showControls();
      setStatus('Playing content');
      break;
    // update ad countdown timers
    case google.ima.dai.api.StreamEvent.Type.AD_PROGRESS:
      updateAdCountdown(e.getStreamData().adProgressData);
      break;
    default:
      logEvent(e);
      break;
  }
}

/**
 * Inserts streamId into stream URL
 * @param {string} streamId - The Stream ID, from the pod stream request
 * @return {string} The stream url with StreamId populated
 */
function buildStreamURL(streamId) {
  let url = streamUrl.value;
  return url.replace('[[STREAMID]]', streamId);
}

/**
 * Updates the stream info with ad Countdowns
 * @param {Object!} data - The Ad Event data
 */
function updateAdCountdown(data) {
  const adPosition = data.adPosition;
  const totalAds = data.totalAds;
  const adBreakDuration = data.adBreakDuration;
  const duration = data.duration;
  const currentTime = data.currentTime;
  let status = 'Ad: ' + adPosition + ' of ' + totalAds + ' | ' +
      toHHMMSS(currentTime) + '/' + toHHMMSS(duration) + ' | ' +
      'Break Duration: ' + adBreakDuration;
  setStatus(status);
}

/**
 * shows the video element controls and hides ad overlay
 */
function showControls() {
  adUiElement.style.display = 'none';
  if (!videoElement.hasAttribute('controls')) {
    videoElement.setAttribute('controls', 'controls');
  }
}

/**
 * hides the video element controls and shows ad overlay
 */
function hideControls() {
  adUiElement.style.display = 'initial';
  if (videoElement.hasAttribute('controls')) {
    videoElement.removeAttribute('controls');
  }
}

/**
 * Loads the video stream and attaches event listeners to update podserving
 * stream
 * @param {string} url - The stream URL
 */
function loadStream(url) {
  logText('Load stream: ' + url);

  if (useNativePlayer()) {
    // safari can load HLS files natively
    videoElement.src = url;
    // listen for metadata events to pass to the streammanager
    videoElement.textTracks.addEventListener('addtrack', onAddTrack);
    onReadyToPlay();
  } else {
    // non-safari browsers need HLS.js
    if (hls) {
      hls.destroy();
    }
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(videoElement);
    // listen for metadata events to pass to the streammanager
    hls.on(Hls.Events.FRAG_PARSING_METADATA, onTimedMetadata);
    hls.on(Hls.Events.MANIFEST_PARSED, onReadyToPlay);
  }
  videoElement.onplay = onPlay;
  videoElement.onpause = onPause;
  videoElement.onplaying = onPlaying;
}

/**
 * Set Playback Status
 */
function onReadyToPlay() {
  setStatus('Ready to Play');
  showControls();
}

/**
 * Parse timed metadata from HLS.js
 * @param {!Event} event - the event object
 * @param {!Array<!Object>} data - the enumerable array of metadata objects
 */
function onTimedMetadata(event, data) {
  if (streamManager && data) {
    data.samples.forEach((sample) => {
      streamManager.processMetadata('ID3', sample.data, sample.pts);
    });
  }
}

/**
 * Parse metadata from native player
 * @param {!Event} event - the addtrack event object
 */
function onAddTrack(event) {
  const track = event.track;
  if (streamManager && track.kind === 'metadata') {
    track.mode = 'hidden';
    track.addEventListener('cuechange', (e) => {
      for (const cue of track.activeCues) {
        const metadata = {};
        metadata[cue.value.key] = cue.value.data;
        streamManager.onTimedMetadata(metadata);
      }
    });
  }
}

/**
 * Set video controls when play starts
 * @param {!Object} event - The event object (unused)
 */
function onPlay(event) {
  if (adPlaying) {
    setStatus('Playing ads');
    hideControls();
  } else {
    setStatus('Playing content');
    showControls();
  }
}

/**
 * Failsafe to show video controls when paused
 * @param {!Object} event - The event object (unused)
 */
function onPause(event) {
  setStatus('Paused');
  showControls();
}

/**
 * Failsafe to show/hide video controls
 * @param {!Object} event - The event object (unused)
 */
function onPlaying(event) {
  if (adPlaying) {
    hideControls();
  } else {
    showControls();
  }
}

/**
 * helper to update contents of #countdown div
 * @param {string} status - The message to output
 */
function setStatus(status) {
  document.getElementById('countdown').textContent = status;
}

/**
 * Simple wrapper function for logging
 * @param {string} text - The message to log
 */
function logText(text) {
  console.log(text);
}

/**
 * Format ad event for logging
 * @param {!Event} event - The ad event object
 */
function logEvent(event) {
  const ad = event.getAd();
  const adPodInfo = ad ? ad.getAdPodInfo() : null;
  const type = event.type;
  const title = ad ? ad.getTitle() : '<no-title>';
  const position = adPodInfo ? adPodInfo.getAdPosition() : 0;
  const totalAds = adPodInfo ? adPodInfo.getTotalAds() : 0;
  logText('Stream manager event:' + type);
  logText(`Ad ${position}/${totalAds}: ${title}` + type);
}

/**
 * Utility function to convert seconds to human-readible time string
 * @param {!float} secNum - number of seconds
 * @return {string} the same duration, represented in h:i:s format
 */
function toHHMMSS(secNum) {
  let hours = Math.floor(secNum / 3600);
  const minutes = Math.floor((secNum - (hours * 3600)) / 60);
  let seconds = Math.floor(secNum - (hours * 3600) - (minutes * 60));

  let hourStr = '';
  if (hours > 0) {
    if (hours < 10) {
      hours = '0' + hours;
    }
    hourStr += hours + ':';
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return hourStr + minutes + ':' + seconds;
}

init();
