(function () {
  function createModal(name, fnOpen, fnClose) {
    if (document.getElementById(name)) {
      console.warn(`Элемент с идентификатором "${name}" уже существует.`);
      return document.getElementById(name);
    }

    function closeModal(modal) {
      modal.close();
      modal.removeEventListener("click", closeOnBackDropClick);
      if (fnClose) fnClose(modal);
    }

    function closeOnBackDropClick({ currentTarget, target }) {
      if (target === currentTarget || target.classList.contains("modal__close")) {
        closeModal(currentTarget);
      }
    }

    function openModal(modal) {
      if (fnOpen) fnOpen(modal);
      modal.showModal();
      modal.addEventListener("click", closeOnBackDropClick);
      modal.closeModal = () => {
        modal.removeEventListener("click", closeOnBackDropClick);
        closeModal(modal);
      };
    }

    const closeButton = document.createElement("button");
    closeButton.classList.add("modal__close");

    const wrapper = document.createElement("div");
    wrapper.classList.add("modal__wrapper");

    wrapper.append(closeButton);

    const modal = document.createElement("dialog");
    modal.id = name;
    modal.classList.add("modal");
    modal.append(wrapper);
    document.body.append(modal);

    modal.openModal = () => openModal(modal);
    return modal;
  }

  function validateDate(endDate, startDate, endInput) {
    endInput.style.border = (endDate < startDate) ?  "1px solid red" : "";
  }

  function checkEndDate(input) {
    if (!input.name.includes('start')) return;
    const startDate = new Date(input.value);
    const endInput = input.closest('tr').querySelector('input[name*="time_end"]');
    if (!endInput.value) return;
    const endDate = new Date(endInput.value);
    validateDate(endDate, startDate, endInput)
  }

  function checkStartDate(input) {
    if (!input.name.includes('end')) return;
    const endDate = new Date(input.value);
    const startDate = new Date(input.closest('tr').querySelector('input[name*="time_start"]').value);
    validateDate(endDate, startDate, input)
  }

  function toggleDateTimeInput(input) {
  input.addEventListener("focus", () => {
      input.type = "datetime-local";
      input.step = 1;
    });
  input.addEventListener("blur", () => {
    input.type = "text";
    input.value = input.value.replace("T", " ");
    checkStartDate(input);
    checkEndDate(input);
  });

}

  function createIframe(id) {
    const iframe = document.createElement("iframe", "modal-iframe");
    iframe.classList.add("iframe");
    iframe.src = "https://support.5th.ru/published/sta/work_log_edit.php?request_id=" + id;
    
    iframe.onload = () => {
      iframe.contentWindow.document.querySelectorAll('input[name*="time"]').forEach(toggleDateTimeInput);
    }
    
    return iframe;
  }

  function createBtn(openModal) {
    const btn = document.createElement("button");
    btn.className = "btn-edit";
    btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</svg>`;
    btn.addEventListener("click", openModal);
    return btn;
  }

  function getRequestIdFromUrl() {
    const hash = window.location.hash;
    const parts = hash.split("/");
    return parts[parts.length - 1];
  }

  const fnOpen = (modal) => {
    const iframe = createIframe(getRequestIdFromUrl());
    modal.children[0].append(iframe);
  };
  const fnClose = (modal) => {
    modal.querySelector("iframe").remove();
    if (document.getElementById("body-frame")) window.frames["body-frame"].contentWindow.location.reload();
    else location.reload();
  };

  const modal = createModal("iframe-modal", fnOpen, fnClose);

  document.body.append(createBtn(modal.openModal));
})();
