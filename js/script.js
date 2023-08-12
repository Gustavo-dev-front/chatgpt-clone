const INPUT_BOX = document.querySelector("#container-input-box");
const INPUT = INPUT_BOX.querySelector(".input-box textarea");
const BTN_SEND = INPUT_BOX.querySelector(".input-box .btn-send");
const CHAT_BOX = document.querySelector("#chat-box");
const BTN_MODE = INPUT_BOX.querySelector(".controls .btn-mode");
const BTN_CLEAR = INPUT_BOX.querySelector(".controls .btn-clear");

const changeColorMode = (mode) => {
  const modeText = mode === "dark-mode" ? "light_mode" : "dark_mode";

  if (mode === "dark-mode") {
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
  }

  BTN_MODE.textContent = modeText;
  localStorage.setItem("default-color-mode", mode);
};

const handleColorMode = () => {
  const isLight = document.body.classList.toggle("light-mode");
  if (isLight) changeColorMode("light-mode");
  else changeColorMode("dark-mode");
};

const cleanChat = () => {
  CHAT_BOX.innerHTML = emptyHistory;
  localStorage.setItem("chat-history", CHAT_BOX.innerHTML);
};

const generateResponse = async (value, message) => {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const API_KEY = "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";
  const API_OPTIONS = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: value }],
      temperature: 0.7,
    }),
  };

  try {
    const response = await (await fetch(API_URL, API_OPTIONS)).json();
    const paragraph = message.querySelector("p");
    paragraph.classList.remove("typing-animation");
    paragraph.innerHTML = "";
    paragraph.textContent = response.choices[0].message.content;
  } catch (error) {
    console.log(error);
  } finally {
    localStorage.setItem("chat-history", CHAT_BOX.innerHTML);
  }
};

const createMessage = (input, role) => {
  const message = document.createElement("div");
  message.classList.add("message", role);

  const content = document.createElement("div");
  content.classList.add("content");
  content.innerHTML = `<picture><img src="./images/${role}.jpg" alt="${role} image"></picture><p></p>`;

  const paragraph = content.querySelector("p");

  if (role === "user") paragraph.textContent = input;
  else if (role === "chatbot") {
    paragraph.classList.add("typing-animation");
    paragraph.innerHTML = `<span class="typing-dot" style="--delay: 0.2s"></span>
                          <span class="typing-dot" style="--delay: 0.3s"></span>
                          <span class="typing-dot" style="--delay: 0.4s"></span>`;
    const copyBtn = document.createElement("span");
    copyBtn.classList.add("material-symbols-outlined");
    copyBtn.textContent = "content_copy";

    content.appendChild(copyBtn);
  }

  message.appendChild(content);
  return message;
};

const enterMessage = () => {
  let value = INPUT.value.trim();
  if (!value) return; // Se o campo estiver vazio, retornar sem nenhuma ação. Caso contrário, irá continuar

  INPUT.value = ""; // Limpar o campo visto que o valor já foi salvo na varíavel "value"
  document.querySelector(".empty-history")?.remove();

  const message = createMessage(value, "user");
  CHAT_BOX.appendChild(message);

  setTimeout(() => {
    const message = createMessage("", "chatbot");
    CHAT_BOX.appendChild(message);
    generateResponse(value, message);
  }, 600);

  localStorage.setItem("chat-history", CHAT_BOX.innerHTML);
};

const chatHistory = localStorage.getItem("chat-history");
const emptyHistory =
  "<h1 class='empty-history'>Envie uma mensagem para iniciar a conversa.</h1>";
CHAT_BOX.innerHTML = chatHistory || emptyHistory;
BTN_SEND.addEventListener("click", enterMessage);

let defaultColorMode = localStorage.getItem("default-color-mode")
  ? localStorage.getItem("default-color-mode")
  : "dark-mode";
changeColorMode(defaultColorMode);
BTN_MODE.addEventListener("click", handleColorMode);

BTN_CLEAR.addEventListener("click", cleanChat);
