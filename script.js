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
// ...dentro de loadComponent, después del bloque de búsqueda...
const orderSelect = document.getElementById('orderSelect');
if (orderSelect && postsContainer) {
  orderSelect.addEventListener('change', function() {
    ordenarPosts(orderSelect.value);
  });

  // Ordenar al cargar por defecto (más recientes)
  ordenarPosts(orderSelect.value);
}

function ordenarPosts(orden) {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  if (orden === 'antiguos') {
    posts.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
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
          renderPostsFiltro();

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
    if (orderSelect) {
      orderSelect.addEventListener('change', renderPostsFiltro);
    }

    // Renderiza al cargar
    renderPostsFiltro();
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

document.addEventListener('DOMContentLoaded', function() {
  const creatorsGrid = document.getElementById('creators-grid');
  if (creatorsGrid) {
    fetch('http://localhost:3000/users')
      .then(res => res.json())
      .then(users => {
        creatorsGrid.innerHTML = users.map(user => {
          // Si el nombre tiene espacio, lo parte en dos líneas
          const nameParts = user.username.split(' ');
          const displayName = nameParts.length > 1
            ? `${nameParts[0]}<br>${nameParts.slice(1).join(' ')}`
            : user.username;
          return `
            <div class="creator-item" style="text-align: center;">
              <a href="Usuario.html?userId=${user.user_id}" style="text-decoration: none; color: inherit;">
                <img src="${user.profile_image_url || 'usuario.jpg'}" class="avatar" style="width: 100px; height: 100px; cursor: pointer;"><br>
                <span style="font-size: 18px;">${displayName}</span>
              </a>
            </div>
          `;
        }).join('');
      });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // Obtener userId de la URL
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  if (!userId) return;

  // Cargar datos del usuario desde el backend
  fetch(`http://localhost:3000/user/${userId}`)
    .then(res => res.json())
    .then(user => {
      document.querySelector('.usuario-info h1').textContent = user.username;
     document.querySelector('.profile-image-circle img').src = user.profile_image_url || 'usuario.jpg';
document.querySelector('.profile-image-container img').src = user.cover_image_url || 'banner_default.jpg';

      // Mostrar los posts de este usuario desde localStorage
      const postsGrid = document.querySelector('.posts-grid');
      if (postsGrid) {
        const allPosts = JSON.parse(localStorage.getItem('posts')) || [];
        // Filtrar posts por nombre de usuario (ajusta si guardas userId en los posts)
        const userPosts = allPosts.filter(post => post.username === user.username);
        postsGrid.innerHTML = userPosts.length
  ? userPosts.map(post => `
      <div class="post">
        <div class="post-header">
          <img src="${post.userImage || 'usuario.jpg'}" alt="avatar" class="avatar">
          <span class="post-author">${post.username}</span>
          <span class="post-options">⋯</span>
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
      </div>
    `).join('')
  : '<p style="text-align:center;">Este usuario no tiene posts aún.</p>';
      }
    });
});

// =================== EDITAR PERFIL ===================
document.addEventListener('DOMContentLoaded', function() {
  const editarPerfilForm = document.getElementById('editarPerfilForm');
  if (!editarPerfilForm) return;

  // Preview de imágenes
  const profileUpload = document.getElementById('profileUpload');
  const coverUpload = document.getElementById('coverUpload');
  if (profileUpload) {
    profileUpload.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const preview = document.getElementById('previewProfile');
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
      }
    });
  }
  if (coverUpload) {
    coverUpload.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const preview = document.getElementById('previewCover');
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
      }
    });
  }

  // Cargar datos del usuario actual desde el backend
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData && userData.id) {
    fetch(`http://localhost:3000/user/${userData.id}`)
      .then(res => res.json())
      .then(user => {
        document.querySelector('input[name="username"]').value = user.username || '';
        document.querySelector('input[name="first_name"]').value = user.first_name || '';
        document.querySelector('input[name="last_name"]').value = user.last_name || '';
        document.querySelector('input[name="email"]').value = user.email || '';
        document.querySelector('input[name="date_of_birth"]').value = user.date_of_birth ? user.date_of_birth.substring(0,10) : '';
        document.querySelector('textarea[name="bio"]').value = user.bio || '';
        if (user.profile_image_url) {
          const previewProfile = document.getElementById('previewProfile');
          previewProfile.src = user.profile_image_url;
          previewProfile.style.display = 'block';
        }
        if (user.cover_image_url) {
          const previewCover = document.getElementById('previewCover');
          previewCover.src = user.cover_image_url;
          previewCover.style.display = 'block';
        }
      })
      .catch(() => {
        // Si hay error, no rellenar nada
      });
  }

  // Mostrar mensajes bonitos en el formulario
  const mensajeDiv = document.getElementById('perfilMensaje');
  function mostrarMensajePerfil(texto, color='#ff4444') {
    if (mensajeDiv) {
      mensajeDiv.textContent = texto;
      mensajeDiv.style.color = color;
    }
  }

  // Guardar cambios del perfil
  editarPerfilForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validación de contraseñas nuevas
    const newPassword = editarPerfilForm.new_password ? editarPerfilForm.new_password.value : '';
    const confirmPassword = editarPerfilForm.confirm_password ? editarPerfilForm.confirm_password.value : '';
    if (newPassword && newPassword !== confirmPassword) {
      mostrarMensajePerfil('Las nuevas contraseñas no coinciden');
      return;
    }

    const formData = new FormData(editarPerfilForm);
    formData.append('user_id', userData.id);

    try {
      const response = await fetch('http://localhost:3000/update-profile', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (response.ok) {
        mostrarMensajePerfil('Perfil actualizado correctamente', '#2ecc71');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        mostrarMensajePerfil(data.error || 'Error al actualizar el perfil');
      }
    } catch (err) {
      mostrarMensajePerfil('Error de conexión con el servidor');
    }
  });
});

function renderPostsFiltro() {
  const postsContainer = document.getElementById('posts-container');
  const searchInput = document.querySelector('.search-bar input[type="text"]');
  const orderSelect = document.getElementById('orderSelect');
  if (!postsContainer) return;

  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  let filteredPosts = posts;

  // Filtro de búsqueda por texto
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (searchText) {
    filteredPosts = filteredPosts.filter(post => {
      const title = post.username ? post.username.toLowerCase() : '';
      const content = post.text ? post.text.toLowerCase() : '';
      return title.includes(searchText) || content.includes(searchText);
    });
  }

  // Filtro de orden
  if (orderSelect && orderSelect.value === 'antiguos') {
    filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  postsContainer.innerHTML = filteredPosts.length
    ? filteredPosts.map(post => `
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
    `).join('')
    : '<p style="text-align:center;">No hay posts que coincidan.</p>';
}