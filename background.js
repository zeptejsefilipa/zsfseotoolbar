chrome.action.onClicked.addListener(async (tab) => {
  const currentState = await chrome.storage.local.get('toolbarActive');
  const toolbarActive = !currentState.toolbarActive;

  await chrome.storage.local.set({ toolbarActive });

  chrome.action.setIcon({
    path: toolbarActive ? {
      "19": "images/icon_on_19.png",
      "38": "images/icon_on_38.png"
    } : {
      "19": "images/icon_off_19.png",
      "38": "images/icon_off_38.png"
    }
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: refreshPage
  });
});

function refreshPage() {
  location.reload();
}
