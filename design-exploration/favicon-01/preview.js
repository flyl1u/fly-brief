(() => {
  const data = JSON.parse(document.querySelector('#comparison-data').textContent);
  const directions = data.directions;
  const gallery = document.querySelector('#directions');
  const promptButton = document.querySelector('#view-prompt');
  const promptDialog = document.querySelector('#prompt-dialog');
  if (typeof data.original_prompt === 'string' && data.original_prompt.trim()) {
    document.querySelector('#prompt-content').textContent = data.original_prompt;
  }

  promptButton.addEventListener('click', () => {
    if (promptDialog.open) return;
    promptDialog.showModal();
    document.documentElement.classList.add('prompt-open');
  });
  document.querySelector('#close-prompt').addEventListener('click', () => { promptDialog.close(); });
  promptDialog.addEventListener('close', () => {
    document.documentElement.classList.remove('prompt-open');
    promptButton.focus();
  });
  promptDialog.addEventListener('click', event => {
    if (event.target !== promptDialog) return;
    const bounds = promptDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) promptDialog.close();
  });

  function selectDirection(direction, { announce = true, updateUrl = true } = {}) {
    const path = `./${direction.icon}`;
    document.querySelector('#preview-favicon').href = path;
    document.querySelector('#selected-icon').src = path;
    document.querySelector('#selected-icon').alt = direction.title;
    document.querySelector('#selected-title').textContent = direction.title;
    document.querySelector('#selected-number').textContent = direction.id;
    document.querySelectorAll('.tab-icon').forEach(icon => { icon.src = path; });
    gallery.querySelectorAll('.direction').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.id === direction.id));
    });
    const download = document.querySelector('#download-selected');
    download.href = path;
    download.download = `${data.download_prefix}-${direction.id}.svg`;
    document.title = `${direction.title} · ${data.brand} 图标探索`;
    if (announce) document.querySelector('#selection-status').textContent = `已在当前标签页试用 ${direction.id} ${direction.title}`;
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('icon', direction.id);
      try { window.history.replaceState(null, '', url); } catch { /* Some file viewers restrict history changes. */ }
    }
  }

  function selectFromUrl() {
    const requested = new URLSearchParams(window.location.search).get('icon');
    selectDirection(directions.find(direction => direction.id === requested) ?? directions[0], { announce: false, updateUrl: false });
  }

  gallery.addEventListener('click', event => {
    const button = event.target.closest('button[data-id]');
    if (!button) return;
    const direction = directions.find(item => item.id === button.dataset.id);
    if (direction) selectDirection(direction);
  });

  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    button.addEventListener('click', () => {
      document.documentElement.dataset.theme = button.dataset.themeChoice;
      document.querySelector('meta[name="theme-color"]').content = button.dataset.themeChoice === 'dark' ? '#151719' : '#f3f2ee';
      document.querySelectorAll('[data-theme-choice]').forEach(option => {
        option.setAttribute('aria-pressed', String(option === button));
      });
    });
  });

  window.addEventListener('popstate', selectFromUrl);
  selectFromUrl();
})();
