// script.js
console.log('Script starting...');

let renderer, scene, camera, controls, sun, planets = [], stars, foregroundParticles;
const canvas = document.getElementById("bg");

function initSolarSystem() {
  console.log('Solar init...');
  if (!canvas) return console.error('No canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(0, 50, 200);

  controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);
  const sunLight = new THREE.PointLight(0xffffff, 2);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const starsGeometry = new THREE.BufferGeometry();
  const starsVertices = [];
  for (let i = 0; i < 10000; i++) {
    starsVertices.push((Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000);
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0x888888, size: 0.5 }));
  scene.add(stars);

  const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
  sun = new THREE.Mesh(sunGeometry, new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.9 }));
  scene.add(sun);

  const planetsData = [
    { radius: 0.4, distance: 12, color: 0x8c7853, speed: 0.004, tilt: 0 },
    { radius: 0.9, distance: 18, color: 0xffc649, speed: 0.0015, tilt: 177 },
    { radius: 1, distance: 25, color: 0x6b93d6, speed: 0.001, tilt: 23.4 },
    { radius: 0.5, distance: 32, color: 0xc1440e, speed: 0.0005, tilt: 25 },
    { radius: 8, distance: 100, color: 0xd8ca9d, speed: 0.0001, tilt: 3 },
    { radius: 7, distance: 150, color: 0xfad5a5, speed: 0.00004, tilt: 26.7 },
    { radius: 3, distance: 220, color: 0x4fd0cd, speed: 0.00002, tilt: 97.8 },
    { radius: 3, distance: 300, color: 0x4b70dd, speed: 0.00001, tilt: 28.3 }
  ];

  planetsData.forEach(data => {
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: data.color, transparent: true, opacity: 0.9 });
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.userData = { ...data, angle: Math.random() * Math.PI * 2 };
    planet.position.x = data.distance;
    scene.add(planet);
    planets.push(planet);

    if (data.radius > 3) {
      const cloudGeo = new THREE.SphereGeometry(data.radius * 1.02, 32, 32);
      const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
      planet.add(new THREE.Mesh(cloudGeo, cloudMat));
    }
    if (data.color === 0xfad5a5) {
      const ringGeo = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2.2, 32);
      const ringMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      planet.add(ring);
    }
  });

  // Add subtle foreground 3D elements: floating particles
  const particleGeometry = new THREE.BufferGeometry();
  const particleVertices = [];
  const particleColors = [];
  const particleSizes = [];
  const color = new THREE.Color();

  for (let i = 0; i < 500; i++) {
    const x = (Math.random() - 0.5) * window.innerWidth / 2;
    const y = (Math.random() - 0.5) * window.innerHeight / 2;
    const z = Math.random() * 50 - 100;
    particleVertices.push(x, y, z);

    color.setHSL(Math.random(), 0.5, 0.7);
    particleColors.push(color.r, color.g, color.b);
    particleSizes.push(Math.random() * 2 + 0.5);
  }

  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particleVertices, 3));
  particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
  particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(particleSizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });

  foregroundParticles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(foregroundParticles);

  console.log('Solar system ready - Planets:', planets.length, 'Foreground particles added');
}

function animate() {
  if (!renderer) return requestAnimationFrame(animate);
  requestAnimationFrame(animate);
  controls.update();

  sun.scale.setScalar(1 + 0.01 * Math.sin(Date.now() * 0.001));

  planets.forEach(planet => {
    const data = planet.userData;
    data.angle += data.speed;
    const ecc = 0.1;
    planet.position.x = Math.cos(data.angle) * data.distance * (1 + ecc * Math.sin(data.angle * 2));
    planet.position.z = Math.sin(data.angle) * data.distance * (1 - ecc * Math.cos(data.angle * 2));
    planet.position.y = Math.sin(data.angle * 0.5) * 2;
    planet.rotation.y += 0.01 / data.radius;
    planet.rotation.x = data.tilt;

    planet.children.forEach(child => {
      if (child.material.opacity < 1) child.rotation.y += 0.002;
    });
  });

  if (stars) stars.rotation.y += 0.0002;

  if (foregroundParticles) {
    foregroundParticles.rotation.y += 0.0005;
    const positions = foregroundParticles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      if (positions[i + 1] > window.innerHeight / 2) positions[i + 1] = -window.innerHeight / 2;
    }
    foregroundParticles.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready');
  initSolarSystem();
  animate();

  // Sebastian's Assistant
  const chatLog = document.getElementById("chat-log");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  function typeText(element, text, delay = 30) {
    element.innerHTML = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        element.innerHTML += text[i++];
        chatLog.scrollTop = chatLog.scrollHeight;
      } else {
        clearInterval(interval);
      }
    }, delay);
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    const userDiv = document.createElement("div");
    userDiv.innerHTML = `<strong style="color: #00f0ff;">You:</strong> ${message}`;
    chatLog.appendChild(userDiv);
    chatLog.scrollTop = chatLog.scrollHeight;

    const aiDiv = document.createElement("div");
    aiDiv.innerHTML = '<strong style="color: #f05fff;">Sebastian\'s Assistant:</strong> Thinking...';
    chatLog.appendChild(aiDiv);
    chatLog.scrollTop = chatLog.scrollHeight;

    userInput.value = "";

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.reply) throw new Error('No reply in response');

      aiDiv.innerHTML = '';
      typeText(aiDiv, `<strong style="color: #f05fff;">Sebastian's Assistant:</strong> ${data.reply}`);
    } catch (error) {
      aiDiv.innerHTML = '';
      typeText(aiDiv, `<strong style="color: #f05fff;">Sebastian's Assistant:</strong> Error: ${error.message}. Check console for details.`);
      console.error('Chat error:', error);
    }
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (userInput) userInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

  if (chatLog) {
    const welcome = document.createElement('div');
    welcome.innerHTML = '<strong style="color: #f05fff;">Sebastian\'s Assistant:</strong> Hi! Ask about my AI work or anything else.';
    chatLog.appendChild(welcome);
  }

  // Prompt Library Automator
  const promptTask = document.getElementById("prompt-task");
  const promptModel = document.getElementById("prompt-model");
  const generatePromptBtn = document.getElementById("generate-prompt");
  const promptOutput = document.getElementById("prompt-output");

  async function generatePrompt() {
    const task = promptTask.value.trim();
    const model = promptModel.value;
    if (!task) {
      promptOutput.innerHTML = '<strong style="color: #f05fff;">Error:</strong> Please enter a task.';
      return;
    }

    promptOutput.innerHTML = '<strong style="color: #f05fff;">Generating...</strong>';
    try {
      const response = await fetch('/api/prompt-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, model })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.prompt) throw new Error('No prompt in response');

      // Display the generated prompt in a formatted way
      promptOutput.innerHTML = `
        <strong style="color: #f05fff;">Generated Prompt:</strong>
        <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">
          ${data.prompt}
        </div>
      `;
    } catch (error) {
      promptOutput.innerHTML = `<strong style="color: #f05fff;">Error:</strong> ${error.message}`;
      console.error('Prompt error:', error);
    }
  }

  if (generatePromptBtn) generatePromptBtn.addEventListener('click', generatePrompt);
  if (promptTask) promptTask.addEventListener('keypress', e => { if (e.key === 'Enter') generatePrompt(); });

  // Freelance Chatbot Builder
  const chatbotGreeting = document.getElementById("chatbot-greeting");
  const chatbotTone = document.getElementById("chatbot-tone");
  const chatbotKeywords = document.getElementById("chatbot-keywords");
  const chatbotInput = document.getElementById("chatbot-input");
  const testChatbotBtn = document.getElementById("test-chatbot");
  const chatbotOutput = document.getElementById("chatbot-output");

  async function testChatbot() {
    const greeting = chatbotGreeting.value.trim();
    const tone = chatbotTone.value;
    const keywords = chatbotKeywords.value.trim();
    const input = chatbotInput.value.trim();

    if (!input) {
      chatbotOutput.innerHTML = '<strong style="color: #f05fff;">Error:</strong> Please enter a test message.';
      return;
    }

    chatbotOutput.innerHTML = '<strong style="color: #f05fff;">Generating...</strong>';
    try {
      const response = await fetch('/api/chatbot-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ greeting, tone, keywords: keywords.split(',').map(k => k.trim()), input })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.response) throw new Error('No response in response');

      chatbotOutput.innerHTML = `<strong style="color: #f05fff;">Chatbot Response:</strong> ${data.response}`;
    } catch (error) {
      chatbotOutput.innerHTML = `<strong style="color: #f05fff;">Error:</strong> ${error.message}`;
      console.error('Chatbot error:', error);
    }
  }

  if (testChatbotBtn) testChatbotBtn.addEventListener('click', testChatbot);
  if (chatbotInput) chatbotInput.addEventListener('keypress', e => { if (e.key === 'Enter') testChatbot(); });
});

window.addEventListener("resize", () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});
