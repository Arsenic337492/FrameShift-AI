import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyB-XX0Jrn6Hk90lSh4fa1RzGQ52YB5IBdE",
  authDomain: "frameshift-ai.firebaseapp.com",
  projectId: "frameshift-ai",
  storageBucket: "frameshift-ai.firebasestorage.app",
  messagingSenderId: "123577930842",
  appId: "1:123577930842:web:9f75179ce2cad1445cb463"
});

const auth = getAuth(app);

const signUpBtn = document.querySelector('.signUpBtn');
if (signUpBtn && signUpBtn.tagName === 'BUTTON') {
  signUpBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const fields = document.querySelectorAll('.input-field');
    const email = fields[0].value;
    const password = fields[1].value;
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = 'login.html';
    } catch (error) {
      alert(error.message);
    }
  });
}

const loginBtn = document.querySelector('.loginBtn');
if (loginBtn && loginBtn.tagName === 'BUTTON') {
  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const fields = document.querySelectorAll('.input-field');
    const email = fields[0].value;
    const password = fields[1].value;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'workspace.html';
    } catch (error) {
      alert(error.message);
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User ID:', user.uid);
  }
});

const navLink = document.getElementById('navLink');
if (navLink) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      navLink.textContent = 'Dashboard';
      navLink.href = 'dashboard.html';
      navLink.className = 'dashboardBtn';
    } else {
      navLink.textContent = 'Login';
      navLink.href = 'login.html';
      navLink.className = 'loginForm';
    }
  });
}

const generateBtn = document.getElementById('generateBtn');
if (generateBtn) {
  generateBtn.addEventListener('click', async () => {
    const theme = document.querySelector('.themeInput').value;
    const plot = document.querySelector('.plotInput').value;
    const duration = document.querySelector('.durationInput').value || '10:00';
    const genre = document.querySelector('.genreInput').value || 'Drama';
    
    if (!theme) {
      alert('Please enter a theme');
      return;
    }
    
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, plot, duration, genre })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('aiResult', data.result);
        window.location.href = 'result.html';
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      generateBtn.textContent = 'Generate';
      generateBtn.disabled = false;
    }
  });
}

const resultContainer = document.getElementById('resultContainer');
if (resultContainer) {
  const result = localStorage.getItem('aiResult');
  if (result) {
    const lines = result.split('\n');
    let conservativeStart = -1;
    let experimentalStart = -1;
    
    lines.forEach((line, index) => {
      if (line.toUpperCase().includes('CONSERVATIVE VERSION')) {
        conservativeStart = index;
      }
      if (line.toUpperCase().includes('EXPERIMENTAL VERSION')) {
        experimentalStart = index;
      }
    });
    
    // Если не нашли conservative, начинаем с начала
    if (conservativeStart === -1 && experimentalStart > -1) {
      conservativeStart = -1;
    }
    
    if (experimentalStart > -1) {
      const conservativeLines = lines.slice(conservativeStart + 1, experimentalStart);
      const experimentalLines = lines.slice(experimentalStart + 1);
      
      const conservative = conservativeLines.join('\n').trim();
      const experimental = experimentalLines.join('\n').trim();
      
      resultContainer.innerHTML = `
        <div class="versionCard">
          <h2>CONSERVATIVE VERSION</h2>
          <pre>${conservative}</pre>
        </div>
        <div class="versionCard">
          <h2>EXPERIMENTAL VERSION</h2>
          <pre>${experimental}</pre>
        </div>
      `;
    } else {
      resultContainer.innerHTML = `<pre>${result}</pre>`;
    }
  } else {
    resultContainer.textContent = 'No result found';
  }
}