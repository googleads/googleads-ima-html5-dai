console.log("initializing IMA");
videoElement = document.getElementById('video');
adUiElement = document.getElementById('adUi');

const NETWORK_CODE = '21775744923';

/**
 * Sample signal collector function.
 * @return {!Promise<string>} A promise that resolves to the encoded signals.
 */
const signalCollector = () => {
 return new Promise((resolve, reject) => {
   resolve("My encoded signal string");
 });
};
if (!googletag) googletag = {};
if (!googletag.secureSignalProviders) googletag.secureSignalProviders = [];
googletag.secureSignalProviders.push({
 networkCode: NETWORK_CODE,
 collectorFunction: signalCollector
});

streamManager = new google.ima.dai.api.StreamManager(videoElement, adUiElement);
