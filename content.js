(async () => {
  const { toolbarActive } = await chrome.storage.local.get('toolbarActive');

  if (toolbarActive) {
    let toolbar = document.querySelector('.seo-toolbar');

    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'seo-toolbar';
      toolbar.innerText = 'SEO BAR';
      document.body.style.marginTop = '30px'; // Adjust the page layout
      document.body.prepend(toolbar);
    }
  } else {
    let toolbar = document.querySelector('.seo-toolbar');
    if (toolbar) {
      toolbar.remove();
    }
  }
})();
