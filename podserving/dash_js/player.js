let adPlaying = false;
let dashPlayer;
let streamManager;

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
  // clear DASH.js instance, if in use
  if (dashPlayer) {
    dashPlayer.destroy();
  }

  // Generate a PodServing Stream Request
  const streamRequest = new google.ima.dai.api.PodStreamRequest();
  streamRequest.networkCode = networkCode;
  streamRequest.customAssetKey = customAssetKey;
  streamRequest.apiKey = apiKey;
  streamRequest.format = 'dash'; // Defaults to 'hls' if not set.
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

  if (dashPlayer) {
    dashPlayer.destroy();
  }
  dashPlayer = dashjs.MediaPlayer().create();
  dashPlayer.initialize(videoElement);
  dashPlayer.attachSource(url);
  // Listen for metadata events to pass to the streamManager.
  // The 'dashString' variable used here is specific to Google pod serving, and
  // may be different in various implementations.
  const dashString = 'https://developer.apple.com/streaming/emsg-id3';
  dashPlayer.on(dashString, processMetadata);
  dashPlayer.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, loadlistener);
  dashPlayer.setMute(true);

  videoElement.onplay = onPlay;
  videoElement.onpause = onPause;
  videoElement.onplaying = onPlaying;
}

/**
 * Listen dor the first manifest to load and set playback status.
 */
function loadlistener() {
  logText('load listener returns');
  setStatus('Ready to Play');
  showControls();

  // This listener must be removed, otherwise it triggers as addional
  // manifests are loaded. The manifest is loaded once for the content,
  // but additional manifests are loaded for upcoming ad breaks.
  dashPlayer.off(dashjs.MediaPlayer.events.MANIFEST_LOADED, loadlistener);
}

/**
 * Process metadata from DASH.js
 * @param {!Event} metadataEvent - the metadata event object
 */
function processMetadata(metadataEvent) {
  const messageData = metadataEvent.event.messageData;
  const timestamp = metadataEvent.event.calculatedPresentationTime;

  // Use StreamManager.processMetadata() if your video player provides raw
  // ID3 tags, as with dash.js.
  streamManager.processMetadata('ID3', messageData, timestamp);
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
