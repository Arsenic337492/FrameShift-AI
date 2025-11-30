import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const app = initializeApp({
  apiKey: "AIzaSyB-XX0Jrn6Hk90lSh4fa1RzGQ52YB5IBdE",
  authDomain: "frameshift-ai.firebaseapp.com",
  projectId: "frameshift-ai",
  storageBucket: "frameshift-ai.firebasestorage.app",
  messagingSenderId: "123577930842",
  appId: "1:123577930842:web:9f75179ce2cad1445cb463"
});

const auth = getAuth(app);
const db = getFirestore(app);

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
      navLink.href = 'index.html';
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
        const user = auth.currentUser;
        if (user) {
          await addDoc(collection(db, 'projects'), {
            userId: user.uid,
            theme: theme,
            plot: plot || '',
            genre: genre,
            duration: duration,
            result: data.result,
            createdAt: new Date()
          });
        }
        
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

const projectsGrid = document.querySelector('.projectsGrid');
if (projectsGrid) {
  let currentFilter = 'all';
  
  const menuItems = document.querySelectorAll('.menuItem');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(m => m.classList.remove('active'));
      item.classList.add('active');
      currentFilter = item.dataset.filter;
      loadProjects();
    });
  });
  
  async function loadProjects() {
    projectsGrid.innerHTML = '<div class="projectCard createCard"><div class="createIcon">+</div></div>';
    
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        let q = query(
          collection(db, 'projects'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const project = doc.data();
          const docId = doc.id;
          
          if (currentFilter === 'favorites' && !project.favorite) return;
          if (currentFilter === 'trash' && !project.deleted) return;
          if (currentFilter === 'all' && project.deleted) return;
          
          const card = document.createElement('div');
          card.className = 'projectCard';
          card.innerHTML = `
            <div class="cardActions">
              <button class="actionBtn favoriteBtn">${project.favorite ? '★' : '☆'}</button>
              <button class="actionBtn deleteBtn">${project.deleted ? '↻' : '🗑'}</button>
            </div>
            <h3>${project.theme}</h3>
            <p>${project.genre} • ${project.duration}</p>
          `;
          
          card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('actionBtn')) {
              localStorage.setItem('aiResult', project.result);
              window.location.href = 'result.html';
            }
          });
          
          card.querySelector('.favoriteBtn').addEventListener('click', async (e) => {
            e.stopPropagation();
            await updateDoc(doc.ref, { favorite: !project.favorite });
            loadProjects();
          });
          
          card.querySelector('.deleteBtn').addEventListener('click', async (e) => {
            e.stopPropagation();
            await updateDoc(doc.ref, { deleted: !project.deleted });
            loadProjects();
          });
          
          projectsGrid.appendChild(card);
        });
        
        const createCard = projectsGrid.querySelector('.createCard');
        if (createCard) {
          createCard.addEventListener('click', () => {
            window.location.href = 'workspace.html';
          });
        }
      }
    });
  }
  
  loadProjects();
}

const createCard = document.querySelector('.createCard');
if (createCard) {
  createCard.addEventListener('click', () => {
    window.location.href = 'workspace.html';
  });
}