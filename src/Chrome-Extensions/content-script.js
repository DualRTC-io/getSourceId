var extensionId = chrome.runtime.id;
var prefix = 'com.tokbox.screenSharing.' + extensionId;

var port = chrome.runtime.connect();
var response = function(method, payload) {
  var res = {
    payload: payload,
    from: 'extension'
  };
  res[prefix] = method;
  return res;
}

// Message handling from background-script
port.onMessage.addListener(function (message) {
  if(message && message.method === 'permissionDenied')
  {
    window.postMessage(response('permissionDenied', message.payload), '*');
  }
  else if (message && message.method === 'sourceId')
  {
    window.postMessage(response('sourceId', message.payload), '*');
  }
});

window.addEventListener('message', function (event) {

  // About exit handling
  if (event.source != window)
  {
    console.warn('[Warning] Source is not window from event.');
    return;
  }

  if (!event.data != null && typeof event.data === 'object' && event.data[prefix] && event.data.payload != null && typeof event.data.payload === 'object')
  {
    return;
  }

  if (event.data.from !== 'jsapi')
  {
    return;
  }


  // About replies handling
  var method = event.data[prefix];
  var payload = event.data.payload;

  if (!payload.requestId)
  {
    console.warn('[Warning] Extension does not have a requestId for replies.');
    return;
  }

  if (method === 'isExtensionInstalled')
  {
    return port.postMessage(response('extensionLoaded', payload), '*');
  }

  if (method === 'getSourceId')
  {
    return port.postMessage({
      method: 'getSourceId',
      payload: payload
    });
  }

});

// Inform to browser that you're available
window.postMessage(response('extensionLoaded'), '*');