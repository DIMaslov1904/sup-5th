const iframeBody = document.getElementById("body-frame");
let d = document;
let iframe;
let ticketId;
const createModal = (name, fnOpen = () => {
}, fnClose = () => {
}) => {
  const modal2 = document.createElement("dialog"), wrapper = document.createElement("div"), closeButton = document.createElement("button");
  const openModal = () => {
    fnOpen && fnOpen(modal2);
    modal2.showModal();
  };
  const closeModal = () => {
    modal2.close();
    fnClose && fnClose(modal2);
  };
  modal2.id = name;
  modal2.className = "modal";
  modal2.addEventListener(
    "click",
    ({ currentTarget, target }) => target === currentTarget && closeModal()
  );
  wrapper.className = "modal__wrapper";
  closeButton.className = "modal__close";
  closeButton.addEventListener("click", closeModal);
  wrapper.append(closeButton);
  modal2.append(wrapper);
  document.body.append(modal2);
  return Object.assign(modal2, { openModal, closeModal });
};
const durationFormat = (duration) => {
  let delta = duration / 1e3, result = "";
  const days = Math.floor(delta / 86400);
  result += days ? `${days} дн ` : "";
  delta -= days * 86400;
  const hours = Math.floor(delta / 3600) % 24;
  result += hours ? hours + " ч " : "";
  delta -= hours * 3600;
  const minutes = Math.floor(delta / 60) % 60;
  result += minutes ? minutes + " м " : "";
  delta -= minutes * 60;
  const seconds = Math.floor(delta % 60);
  return result + seconds + " с";
};
const toggleDateTimeInput = (input) => {
  var _a, _b;
  const startInput = (_a = input.closest("tr")) == null ? void 0 : _a.querySelector('input[name*="time_start"]');
  const endInput = (_b = input.closest("tr")) == null ? void 0 : _b.querySelector('input[name*="time_end"]');
  const interval = document.createElement("div");
  interval.style.position = "absolute";
  endInput.insertAdjacentElement("afterend", interval);
  input.addEventListener("focus", () => {
    input.type = "datetime-local";
    input.step = "1";
  });
  input.addEventListener("blur", () => {
    input.type = "text";
    input.value = input.value.replace("T", " ");
    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value);
    startInput.style.border = endDate < startDate || !startInput.value ? "1px solid red" : "";
    endInput.style.border = endDate < startDate || !endInput.value ? "1px solid red" : "";
    interval.innerText = startInput.value && endInput.value ? durationFormat(endDate.getTime() - startDate.getTime()) : "";
  });
};
const createIframe = (id) => {
  const ifrm = document.createElement("iframe");
  ifrm.classList.add("iframe");
  ifrm.src = "https://support.5th.ru/published/sta/work_log_edit.php?request_id=" + id;
  ifrm.onload = () => {
    var _a;
    return ((_a = ifrm.contentWindow) == null ? void 0 : _a.document.querySelectorAll(
      'input[name*="time"]'
    )).forEach(toggleDateTimeInput);
  };
  return ifrm;
};
const getRequestIdFromUrl = () => {
  var _a;
  const parts = window.location.hash.split("/");
  if (parts[parts.length - 2] === "id") return parts[parts.length - 1];
  return (_a = d.querySelector(".date.request-id b")) == null ? void 0 : _a.innerHTML;
};
const prevOnOpenModal = () => {
  ticketId = getRequestIdFromUrl();
  iframe = createIframe(getRequestIdFromUrl());
  modal.children[0].append(iframe);
};
const nextOnCloseModal = () => {
  var _a;
  iframe && iframe.remove();
  const rowTicket = d.querySelector(`[rel='${ticketId}']`);
  if (rowTicket) return rowTicket.dispatchEvent(new Event("mousedown"));
  const iframeLocation = (_a = iframeBody == null ? void 0 : iframeBody.contentWindow) == null ? void 0 : _a.location;
  (iframeLocation ? iframeLocation : location).reload();
};
const modal = createModal("iframe-modal", prevOnOpenModal, nextOnCloseModal);
const waitForElm = (selector) => {
  return new Promise((resolve) => {
    const element = d.querySelector(selector);
    if (element) return resolve(element);
    const observer = new MutationObserver(() => {
      const element2 = d.querySelector(selector);
      if (!element2) return;
      observer.disconnect();
      resolve(element2);
    });
    observer.observe(d.body, { childList: true, subtree: true });
  });
};
const createBtn = () => {
  const btn = document.createElement("button");
  btn.className = "ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only edit-time-taskt";
  btn.role = "button";
  const span = document.createElement("span");
  span.className = "ui-button-text";
  span.innerText = "Редактировать";
  btn.appendChild(span);
  return btn;
};
const getBtns = async () => {
  await waitForElm(".ticket-toolbar-bg .buttons");
  d.querySelectorAll(".ticket-toolbar-bg .buttons").forEach((wrap) => {
    const b = createBtn();
    b.addEventListener("click", modal.openModal);
    b.addEventListener("mouseover", () => {
      b.classList.add("ui-state-hover");
    });
    b.addEventListener("mouseout", () => {
      b.classList.remove("ui-state-hover");
    });
    wrap.insertBefore(b, wrap.children[0]);
  });
};
const updateContainerActions = async (mutationRecords) => {
  var _a;
  try {
    if (((_a = mutationRecords[1].addedNodes[0]) == null ? void 0 : _a.id) !== "ticket-wrapper") return;
  } catch (error) {
  }
  getBtns();
};
const startObserverTicketWrapper = async () => {
  const wrap = (await waitForElm("#ticket-wrapper")).parentElement;
  getBtns();
  new MutationObserver(updateContainerActions).observe(wrap, { childList: true });
};
if (iframeBody) iframeBody.addEventListener("load", () => {
  var _a;
  d = (_a = iframeBody == null ? void 0 : iframeBody.contentWindow) == null ? void 0 : _a.document;
  startObserverTicketWrapper();
});
else startObserverTicketWrapper();
