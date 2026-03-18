function stripHtml(input) {
  return input.replace(/<[^>]*>/g, "");
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderMessage(container, message, prepend = false) {
  const item = document.createElement("p");
  item.className = "guestbook-msg";
  item.textContent = message;
  item.style.transform = `rotate(${randomInt(-3, 3)}deg)`;
  item.style.fontSize = `${0.9 + Math.random() * 0.2}em`;
  if (prepend && container.firstChild) {
    container.insertBefore(item, container.firstChild);
    return;
  }
  container.append(item);
}

export async function initGuestbook(siteConfig) {
  const wall = document.querySelector("#guestbook-wall");
  const form = document.querySelector("#guestbook-form");
  const input = document.querySelector("#guestbook-input");
  const counter = document.querySelector("#guestbook-count");
  const maxLength = siteConfig?.guestbook?.maxLength || 100;
  if (!wall || !form || !input || !counter) {
    return;
  }

  const refreshMessages = async () => {
    try {
      const response = await fetch(siteConfig.guestbook.readEndpoint);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      wall.innerHTML = "";
      (data.messages || []).forEach((entry) => {
        renderMessage(wall, entry.message);
      });
    } catch {
      // No-op fallback for local/no-backend mode.
    }
  };

  const updateCounter = () => {
    counter.textContent = `${input.value.length}/${maxLength}`;
  };

  input.setAttribute("maxlength", String(maxLength));
  input.addEventListener("input", updateCounter);
  updateCounter();
  refreshMessages();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = stripHtml(input.value.trim()).slice(0, maxLength);
    if (!value) {
      return;
    }

    try {
      const response = await fetch(siteConfig.guestbook.writeEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ message: value })
      });
      if (!response.ok) {
        return;
      }
      renderMessage(wall, value, true);
      input.value = "";
      updateCounter();
    } catch {
      // No-op fallback for local/no-backend mode.
    }
  });
}
