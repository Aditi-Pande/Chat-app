const socket = io()

const clientsTotal = document.getElementById('client-total')
const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const loginBtn = document.getElementById('login-btn')
const authNameInput = document.getElementById('auth-name-input')
const authContainer = document.getElementById('auth-container')
const chatContainer = document.getElementById('chat-container')
const messageTone = new Audio('/message-tone.mp3')

let username = ''

loginBtn.addEventListener('click', () => {
  username = authNameInput.value.trim()

  if (username === '') {
    document.getElementById("error_message").style.display = "block"; 
    return
  }

  socket.emit('authenticate', { username })

  authContainer.style.display = 'none'
  chatContainer.style.display = 'block'
  nameInput.value = username
})

messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
})

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`
})

socket.on('user-connected', (data) => {
  const element = `
    <li class="notification">${data.username} has joined the chat.</li>
  `
  messageContainer.innerHTML += element
})

socket.on('user-disconnected', (data) => {
  const element = `
    <li class="notification">${data.username} has left the chat.</li>
  `
  messageContainer.innerHTML += element
})

function sendMessage() {
  if (messageInput.value === '') return

  const data = {
    name: username,
    message: messageInput.value,
    dateTime: new Date(),
  }
  socket.emit('message', data)
  addMessageToUI(true, data)
  messageInput.value = ''
}

socket.on('chat-message', (data) => {
  messageTone.play()
  addMessageToUI(false, data)
})

function addMessageToUI(isOwnMessage, data) {
  clearFeedback()
  const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        <span>${data.name} ● ${moment(data.dateTime).format('h:mm A')}</span>
      </p>
    </li>
  `
  messageContainer.innerHTML += element
  scrollToBottom()
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

socket.on('feedback', (data) => {
  clearFeedback()
  if (data.feedback) {
    const element = `
      <li class="message-feedback">
        <p class="feedback" id="feedback">${data.feedback}</p>
      </li>
    `
    messageContainer.innerHTML += element
  }
})

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element)
  })
}
