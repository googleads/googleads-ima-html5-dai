// Instance of the Hls.js that handles the main content stream.
let contentHandler;
// Instance of the Hls.js that handles ad breaks.
let adsHandler;
// The reference to the IMA SDK stream manager, set when the stream is loaded.
let streamManager;
// The DAI session ID, set following STREAM_INITIALIZED event, after the
// PodStreamRequest is successful.
let streamId;
// Track if the content video needs to seek to live head.
let isSeekingToLive = false;

// DOM element references
const setSampleContentStreamButton =
    document.getElementById("content-stream-sample");
const setSampleAdBreakParamsButton = document.getElementById("ad-break-sample");

const contentStreamUrlInput = document.getElementById("content-stream-url");
const networkCodeInput = document.getElementById("network-code");
const customAssetKeyInput = document.getElementById("custom-asset-key");
const podHMACKeyInput = document.getElementById("pod-hmac-key");
const playContentStreamButton = document.getElementById("play-content-stream");
const secondsUntilAdBreakInput = document.getElementById("seconds-to-ad-break");
const insertAdBreakButton = document.getElementById("insert-ad-break");
const resumeAdButton = document.getElementById("resume-ad");

// Container for IMA SDK to display ad UI elements.
const adUiElement = document.getElementById("ad-ui");
const contentVideoElement = document.getElementById("video");
const adVideoElement = document.getElementById("video-ads");
const logElement = document.getElementById("log");

/**
 * Initializes the page, including HLS.js instances and the IMA StreamManager.
 * This is the main entry point.
 */
function initializeApp() {
  initializeContentHandler();
  initializeAdsHandler();
  initializeStreamManager();

  insertAdBreakButton.onclick = insertAdBreak;
  playContentStreamButton.onclick = (e) => {
    e.preventDefault();
    // Makes a stream request to Google Ad Manager.
    registerLivestreamSession(
      networkCodeInput.value,
      customAssetKeyInput.value
    );
    playContentStreamButton.disabled = true;
    insertAdBreakButton.disabled = false;
    // Loads the content stream and plays it automatically.
    loadContentStream();
  };

  // Listen for the `seeked` event on the video element.
  video.addEventListener('seeked', () => {
    // Check if the seek operation was for resuming playback following an ad.
    // This ensures a more seamless transition to the live play head.
    if (isSeekingToLive) {
      log('Seek complete, resuming playback...');
      resumeContentStream();
      isSeekingToLive = false;
    }
  });
}

/**
 * Initializes the HLS.js instance that loads and parses the content m3u8
 * playlist.
 */
function initializeContentHandler() {
  contentHandler = new Hls();
  contentHandler.on(Hls.Events.MANIFEST_PARSED, () => {
    contentHandler.attachMedia(contentVideoElement);
  });
  contentHandler.on(Hls.Events.MEDIA_ATTACHED, () => {
    setStatus("Content is playing");
    contentVideoElement.play();
  });
}

/**
 * Initializes the HLS.js instance that loads and parses the ad pod manifest.
 */
function initializeAdsHandler() {
  adsHandler = new Hls();
  // Listener to process ID3 metadata for the stream manager.
  adsHandler.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
    if (streamManager && data) {
      data.samples.forEach((sample) => {
        streamManager.processMetadata("ID3", sample.data, sample.pts);
      });
    }
  });
}

/**
 * Inserts an ad break into the content stream.
 * @param {!Event} e - the event object
 */
async function insertAdBreak(e) {
  e.preventDefault();
  insertAdBreakButton.disabled = true;
  const adsManifestParsingPromise = new Promise((resolve, reject) => {
    adsHandler.on(Hls.Events.MANIFEST_PARSED, resolve);
    adsHandler.on(Hls.Events.ERROR, reject);
  });

  // Schedule the ad break to start by `secondsUntilAdBreak`.
  const adBreakTimingPromise = new Promise((resolve) => {
    let secondsUntilAdBreak = parseInt(secondsUntilAdBreakInput.value);
    setTimeout(resolve, 1000 * secondsUntilAdBreak);
    const timer = setInterval(() => {
      secondsUntilAdBreak--;
      if (secondsUntilAdBreak < 1) {
        clearInterval(timer);
      } else {
        setStatus("Ad break starting in " + secondsUntilAdBreak + " seconds");
      }
    }, 1000);
  });

  // Create an ad pod identifier. In production app, this identifier value must
  // be the same for all concurrent viewers to request the ad pod at the same
  // ad break time.
  const podId = Math.floor(Date.now() / 60000);
  const adBreakId = `ab${podId}`;
  const adBreakParams = {
    ad_break_id: adBreakId,
    custom_asset_key: customAssetKeyInput.value,
    network_code: networkCodeInput.value,
    pd: '31000',
    stream_id: streamId,
    exp: Date.now() + 10000
  };
  const hmacToken = await generateHMACToken(podHMACKeyInput.value, adBreakParams);
  const adPodUrl = `https://dai.google.com/linear/pods/v1/hls/network/${
      adBreakParams.network_code}/custom_asset/${
      adBreakParams.custom_asset_key}/ad_break_id/${adBreakParams.ad_break_id}.m3u8?stream_id=${
      adBreakParams.stream_id}&pd=${adBreakParams.pd}&auth-token=${hmacToken}`;

  log(`Ad break request: ${adPodUrl}`);
  adsHandler.once(Hls.Events.MEDIA_DETACHED, () => {
    adsHandler.attachMedia(adVideoElement);
    adsHandler.loadSource(adPodUrl);
  });
  adsHandler.detachMedia();

  // When the scheduled time has come, the ad pod manifest is parsed, and media
  // is attached. Now the ad can play.
  Promise.all([adsManifestParsingPromise, adBreakTimingPromise]).then(() => {
    adVideoElement.classList.remove("hidden");
    contentVideoElement.classList.add("hidden");
    contentVideoElement.pause();
    setStatus("Ad is playing");
    adVideoElement.play();
  });
}

/**
 * Generates an HMAC token for authenticating pod requests.
 * @param {string} hmacKey - The HMAC secret key.
 * @param {!Object} params - The parameters to sign.
 * @return {!Promise<string>} The encoded signed token string.
 */
const generateHMACToken = async (hmacKey, params) => {
  // copybara:strip_begin(reason: Internal-specific logic)
  // This block is for the INTERNAL version.
  // It uses the client-side function to generate the HMAC token.
  const sortedKeys = Object.keys(params).sort();
  const tokenString = sortedKeys.map(key => `${key}=${params[key]}`).join('~');

  log(`Token string to sign: ${tokenString}`);

  const encoder = new TextEncoder();
  const keyData = encoder.encode(hmacKey);
  const messageData = encoder.encode(tokenString);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const signedTokenString = `${tokenString}~hmac=${hashHex}`;
  return encodeURIComponent(signedTokenString);
  // copybara:strip_end_and_replace_begin
  // // TODO: Use a server-side function to generate the HMAC token. For more
  // // details, see https://developers.google.com/ad-manager/dynamic-ad-insertion/api/pod-serving/live/pod-manifest-requests.
  // throw new Error('HMAC token generation not implemented.');
  // copybara:replace_end
};

/**
 * Loads the content stream.
 */
function loadContentStream() {
  insertAdBreakButton.disabled = false;
  contentHandler.loadSource(contentStreamUrlInput.value);
}

/**
 * Handle seeking to the live playhead if needed, and resuming content after an ad break.
 */
function onAdBreakEnded() {
  insertAdBreakButton.disabled = false;
  // Seek to the live edge after the ad break.
  if (contentHandler.liveSyncPosition) {
    log('Seeking to live edge');
    isSeekingToLive = true;
    video.currentTime = contentHandler.liveSyncPosition;
  } else {
    resumeContentStream();
  }
}

/**
 * Resumes the content stream.
 */
function resumeContentStream() {
  insertAdBreakButton.disabled = false;
  contentVideoElement.classList.remove("hidden");
  adVideoElement.classList.add("hidden");
  adVideoElement.pause();
  setStatus("Content has resumed playing");
  contentVideoElement.play();
}

/**
 * Creates the IMA StreamManager and sets ad event listeners.
 */
function initializeStreamManager() {
  if (!streamManager) {
    // The adUiElement is the container object for ad UI elements.
    streamManager = new google.ima.dai.api.StreamManager(
      adVideoElement,
      adUiElement
    );
    // Register listeners for various stream events.
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.ERROR, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.CLICK, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.STARTED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.FIRST_QUARTILE, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.MIDPOINT, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.THIRD_QUARTILE, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.COMPLETE, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.AD_PROGRESS, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.PAUSED, onStreamEvent);
    streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type.RESUMED, onStreamEvent);
  }
  // Setup for the resume ad button. Needed when IMA pauses ads when the user
  // navigates to to the clickthrough URL.
  resumeAdButton.onclick = (e) => {
    e.preventDefault();
    adVideoElement.play();
    resumeAdButton.disabled = true;
  };
}

/**
 * Registers a SGAI livestream session with the stream manager.
 * @param {string} networkCode - Google Ad Manager network code.
 * @param {string} customAssetKey - the DAI livestream custom asset key.
 */
function registerLivestreamSession(networkCode, customAssetKey) {
  const streamRequest = new google.ima.dai.api.PodStreamRequest();
  // Find your Google Ad Manager network code.
  // https://support.google.com/admanager/answer/7674889?#network-code
  streamRequest.networkCode = networkCode;
  // Google DAI livestream custom asset key.
  streamRequest.customAssetKey = customAssetKey;
  // Register a streaming session on Google Ad Manager DAI servers.
  streamManager.requestStream(streamRequest);
}

/**
 * Handle stream events
 * @param {!Event} e - the event object
 */
function onStreamEvent(e) {
  switch (e.type) {
    case google.ima.dai.api.StreamEvent.Type.STREAM_INITIALIZED:
      // Save the ad stream session ID to construct ad pod requests.
      streamId = e.getStreamData().streamId;
      log("SGAI stream registration succeeded. Session ID: " + streamId);
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      setStatus("Error playing ads");
      log("ERROR: " + e.getStreamData().errorMessage);
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      log("Ad break started");
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      log("Ad break ended");
      adsHandler.detachMedia();
      onAdBreakEnded();
      break;
    case google.ima.dai.api.StreamEvent.Type.PAUSED:
      resumeAdButton.disabled = false;
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_PROGRESS:
      //  Avoid logging AD_PROGRESS events.
      break;
    default:
      logEvent(e);
      break;
  }
}

/**
 * Sets the status of the video element.
 * @param {string} status - The message to set.
 */
function setStatus(status) {
  document.getElementById("video-status").textContent = status;
}

/**
 * Simple wrapper function for logging.
 * @param {string} text - The message to log
 */
function log(text) {
  console.log(text);
  logElement.innerText = text + "\n" + logElement.innerText;
}

/**
 * Format ad event for logging.
 * @param {!Event} event - The ad event object
 */
function logEvent(event) {
  const ad = event.getAd();
  const adPodInfo = ad ? ad.getAdPodInfo() : null;
  const eventType = event.type;
  log("Stream manager event: " + eventType);
  if (ad) {
    const title = ad.getTitle() || "<no-title>";
    const position = adPodInfo ? adPodInfo.getAdPosition() : 0;
    const totalAds = adPodInfo ? adPodInfo.getTotalAds() : 0;
    log(`Ad ${position}/${totalAds}: ${title} - Event: ${eventType}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});
