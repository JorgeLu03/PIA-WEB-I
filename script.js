// Cache for components
const componentCache = new Map();

// ...existing code...

document.addEventListener('DOMContentLoaded', function() {
  const recuperarForm = document.getElementById('recuperarForm');
  if (recuperarForm) {
    recuperarForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const mensaje = document.getElementById('mensajeRecuperar');
      mensaje.textContent = 'Se envió un enlace de recuperación al correo proporcionado.';
      mensaje.style.color = '#2ecc71';
    });
  }
});
// ...existing code...

document.addEventListener('DOMContentLoaded', function() {
  // Recuperar contraseña
  const recuperarForm = document.getElementById('recuperarForm');
  if (recuperarForm) {
    recuperarForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const mensaje = document.getElementById('mensajeRecuperar');
      mensaje.textContent = 'Se envió un enlace de confirmación al correo proporcionado.';
      mensaje.style.color = '#fff';
    });
  }
});
// Function to load and cache components
async function loadComponent(containerId, file) {
    try {
        // Check if component is already cached
        if (componentCache.has(file)) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = componentCache.get(file);
                return;
            }
        }

        // If not cached, fetch and cache it
        const response = await fetch(`COMPONENTS/${file}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const html = await response.text();
        
        // Cache the HTML
        componentCache.set(file, html);
        
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = html;

        // Si es el header, actualizar los datos del usuario después de cargarlo
        if (file === 'header.html') {
    updateUserData();

    // Agregar búsqueda después de cargar el header
    const searchInput = document.querySelector('.search-bar input[type="text"]');
const postsContainer = document.getElementById('posts-container');
if (searchInput && postsContainer) {
  // Limpiar búsqueda y mostrar todos los posts al cargar
  searchInput.value = '';
  const posts = postsContainer.querySelectorAll('.post');
  posts.forEach(post => {
    post.style.display = '';
  });

  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const searchText = searchInput.value.trim().toLowerCase();
      posts.forEach(post => {
        const title = post.querySelector('.post-title')?.textContent.toLowerCase() || '';
        const content = post.querySelector('.post-text')?.textContent.toLowerCase() || '';
        if (title.includes(searchText) || content.includes(searchText)) {
          post.style.display = '';
        } else {
          post.style.display = 'none';
        }
      });
    }
  });
}
}
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
    }
}

// Function to update user data in the header
function updateUserData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Solo actualizar el header si estamos en una página que lo requiere
    if (!document.getElementById('header-container')) {
        return;
    }

    if (!userData) {
        // Si no hay datos de usuario y no estamos en la página de login, redirigir
        if (!window.location.pathname.includes('index_login.html') && 
            !window.location.pathname.includes('registro.html')) {
            window.location.href = 'index_login.html';
        }
        return;
    }

    // Actualizar nombre de usuario y foto de perfil
    const userSpan = document.querySelector('.user-profile span');
    const userImg = document.querySelector('.user-profile img');
    
    if (userSpan) {
        userSpan.textContent = userData.username || 'Usuario';
    }
    
    if (userImg) {
        if (userData.profile_image_url) {
            userImg.src = userData.profile_image_url;
        } else {
            userImg.src = 'usuario.jpg'; // Imagen por defecto
        }
        // Hacer la imagen clickeable
        userImg.style.cursor = 'pointer';
        userImg.addEventListener('click', function() {
            window.location.href = 'editar_perfil.html';
        });
    }
}

// Preload all components
async function preloadComponents() {
    const components = [
        { id: 'sidebar-container', file: 'sidebar.html' },
        { id: 'header-container', file: 'header.html' },
        { id: 'footer-container', file: 'footer.html' }
    ];

    await Promise.all(components.map(comp => loadComponent(comp.id, comp.file)));
}

function handleNavigation(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        
        // Si vas a inicio.html, limpia búsqueda y muestra todos los posts
        if (href === 'inicio.html') {
            const searchInput = document.querySelector('.search-bar input[type="text"]');
            const postsContainer = document.getElementById('posts-container');
            if (searchInput && postsContainer) {
                searchInput.value = '';
                const posts = postsContainer.querySelectorAll('.post');
                posts.forEach(post => {
                    post.style.display = '';
                });
            }
        }

        // Only navigate if it's not the current page
        if (href !== window.location.pathname.split('/').pop()) {
            window.location.href = href;
        }
    }
}   

// Handle image preview
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        const preview = document.getElementById('imagePreview');
        const removeBtn = document.querySelector('.remove-image');
        const previewContainer = document.querySelector('.preview-container');

        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            removeBtn.style.display = 'block';
            previewContainer.style.display = 'inline-block';
        }
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    const preview = document.getElementById('imagePreview');
    const removeBtn = document.querySelector('.remove-image');
    const fileInput = document.getElementById('fileUpload');
    const previewContainer = document.querySelector('.preview-container');
    
    preview.src = '';
    preview.style.display = 'none';
    removeBtn.style.display = 'none';
    previewContainer.style.display = 'none';
    fileInput.value = '';
}

// Función para manejar las reacciones
function toggleReaction(button, type) {
  const icon = button.querySelector('.material-icons');
  const count = button.querySelector('.reaction-count');
  
  if (button.classList.contains('active')) {
    button.classList.remove('active');
    count.textContent = parseInt(count.textContent) - 1;
    
    // Restaurar ícono original
    switch(type) {
      case 'like':
        icon.textContent = 'thumb_up';
        break;
      case 'dislike':
        icon.textContent = 'favorite_border';
        break;
      case 'bookmark':
        icon.textContent = 'bookmark_border';
        break;
    }
  } else {
    button.classList.add('active');
    count.textContent = parseInt(count.textContent) + 1;
    
    // Cambiar ícono cuando está activo
    switch(type) {
      case 'like':
        icon.textContent = 'thumb_up_alt';
        break;
      case 'dislike':
        icon.textContent = 'favorite';
        break;
      case 'bookmark':
        icon.textContent = 'bookmark';
        break;
    }
  }
}


// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Preload all components
    await preloadComponents();

    // Add navigation handler to sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', handleNavigation);
    }

    // Initialize image preview handlers
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload) {
        fileUpload.addEventListener('change', handleImagePreview);
    }

    // Login functionality
    const botonContinuar = document.getElementById('btnContinuar');
    if (botonContinuar) {
        botonContinuar.addEventListener('click', function() {
            window.location.href = 'inicio.html';
        });
    }

    // New post button functionality
    const newPostBtn = document.querySelector('.new-post');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', () => {
            console.log('New post button clicked');
            // Add your new post logic here
        });
    }

    // Actualizar datos del usuario en el header
    updateUserData();
});

// Búsqueda de posts por texto al presionar Enter en el buscador del header
document.addEventListener('DOMContentLoaded', function() {
  // Espera breve para asegurar que el header esté en el DOM si se carga dinámicamente
  setTimeout(() => {
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    const postsContainer = document.getElementById('posts-container');
    if (searchInput && postsContainer) {
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const searchText = searchInput.value.trim().toLowerCase();
          const posts = postsContainer.querySelectorAll('.post');
          posts.forEach(post => {
            const title = post.querySelector('.post-title')?.textContent.toLowerCase() || '';
            const content = post.querySelector('.post-text')?.textContent.toLowerCase() || '';
            if (title.includes(searchText) || content.includes(searchText)) {
              post.style.display = '';
            } else {
              post.style.display = 'none';
            }
          });
        }
      });
    }
  }, 200);
});

document.addEventListener('DOMContentLoaded', function() {
  const postBtn = document.querySelector('.post-btn');
  const textarea = document.getElementById('contenidoPost');
  const fileInput = document.getElementById('fileUpload');

  if (postBtn && textarea && fileInput) {
    postBtn.addEventListener('click', function(e) {
      e.preventDefault();

      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        alert('Debes iniciar sesión para publicar.');
        return;
      }

      const text = textarea.value.trim();
      if (!text) {
        alert('El contenido no puede estar vacío.');
        return;
      }

      // Leer imagen si existe
      const file = fileInput.files[0];
      if (file) {
  const reader = new FileReader();
  reader.onload = function(evt) {
    savePost(userData.username, text, evt.target.result, userData.profile_image_url);
  };
  reader.readAsDataURL(file);
} else {
  savePost(userData.username, text, null, userData.profile_image_url);
}
    });
  }

  function savePost(username, text, imageData, userImage) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  posts.unshift({
    username,
    text,
    image: imageData,
    userImage: userImage, // Guarda la imagen de usuario
    date: new Date().toISOString()
  });
  localStorage.setItem('posts', JSON.stringify(posts));
  window.location.href = 'inicio.html';
}
});
document.addEventListener('DOMContentLoaded', function() {
  const postsContainer = document.getElementById('posts-container');
  if (postsContainer) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    postsContainer.innerHTML = posts.map(post => `
  <article class="post">
    <div class="post-header">
      <img src="${post.userImage || 'usuario.jpg'}" class="avatar" />
      <h3 class="post-title">${post.username}</h3>
    </div>
    <p class="post-text">${post.text}</p>
    ${post.image ? `<img src="${post.image}" class="post-img" />` : ''}
        <div class="post-actions">
          <button class="reaction-btn" onclick="toggleReaction(this, 'like')">
            <span class="material-icons">thumb_up</span>
            <span class="reaction-count">0</span>
          </button>
          <button class="reaction-btn" onclick="toggleReaction(this, 'dislike')">
            <span class="material-icons">favorite_border</span>
            <span class="reaction-count">0</span>
          </button>
          <button class="reaction-btn" onclick="toggleReaction(this, 'bookmark')">
            <span class="material-icons">bookmark_border</span>
            <span class="reaction-count">0</span>
          </button>
        </div>
      </article>
    `).join('');
  }
});