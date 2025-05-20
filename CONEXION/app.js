const express = require('express');
const mysql = require('mysql2');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuración de CORS más específica
app.use(cors({
    origin: '*', // En producción, especifica los dominios permitidos
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max-file-size
}));
app.use(express.static(path.join(__dirname, '../')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuración de la conexión a la base de datos
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'LUNA',
    database: 'truth_db'
});

// Manejo de la conexión a la base de datos
conexion.connect(function(err) {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, date_of_birth, bio } = req.body;
        
        // Validaciones de campos requeridos
        if (!username) return res.status(400).json({ error: 'El nombre de usuario es requerido' });
        if (!email) return res.status(400).json({ error: 'El correo electrónico es requerido' });
        if (!password) return res.status(400).json({ error: 'La contraseña es requerida' });
        if (!first_name) return res.status(400).json({ error: 'El nombre es requerido' });
        if (!last_name) return res.status(400).json({ error: 'El apellido es requerido' });
        if (!date_of_birth) return res.status(400).json({ error: 'La fecha de nacimiento es requerida' });

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
        }

        // Validación de longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el usuario ya existe
        const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
        conexion.query(checkUserQuery, [username, email], async (error, results) => {
            if (error) {
                console.error('Error al verificar usuario:', error);
                return res.status(500).json({ error: 'Error al verificar usuario existente' });
            }

            if (results.length > 0) {
                const existingUser = results[0];
                if (existingUser.username === username) {
                    return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
                }
                if (existingUser.email === email) {
                    return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
                }
            }

            // Manejo de las imágenes
            let profile_image_url = '';
            let cover_image_url = '';

            if (req.files) {
                try {
                    if (req.files.profile_image) {
                        const profileImage = req.files.profile_image;
                        // Validar tipo de archivo
                        if (!profileImage.mimetype.startsWith('image/')) {
                            return res.status(400).json({ error: 'El archivo de perfil debe ser una imagen' });
                        }
                        const profileImageName = `profile_${Date.now()}${path.extname(profileImage.name)}`;
                        await profileImage.mv(`../uploads/${profileImageName}`);
                        profile_image_url = `/uploads/${profileImageName}`;
                    }
                    
                    if (req.files.cover_image) {
                        const coverImage = req.files.cover_image;
                        // Validar tipo de archivo
                        if (!coverImage.mimetype.startsWith('image/')) {
                            return res.status(400).json({ error: 'El archivo de portada debe ser una imagen' });
                        }
                        const coverImageName = `cover_${Date.now()}${path.extname(coverImage.name)}`;
                        await coverImage.mv(`../uploads/${coverImageName}`);
                        cover_image_url = `/uploads/${coverImageName}`;
                    }
                } catch (uploadError) {
                    console.error('Error al subir imágenes:', uploadError);
                    return res.status(500).json({ error: 'Error al procesar las imágenes' });
                }
            }

            const query = `INSERT INTO users (username, email, password_hash, first_name, last_name, 
                           date_of_birth, profile_image_url, cover_image_url, bio, created_at, updated_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

            conexion.query(
                query,
                [username, email, password, first_name, last_name, date_of_birth, profile_image_url, cover_image_url, bio],
                (error, results) => {
                    if (error) {
                        console.error('Error en la consulta SQL:', error);
                        // Detectar errores específicos de MySQL
                        if (error.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ error: 'El usuario o correo electrónico ya existe' });
                        }
                        if (error.code === 'ER_DATA_TOO_LONG') {
                            return res.status(400).json({ error: 'Algunos datos exceden el límite permitido' });
                        }
                        return res.status(500).json({ error: 'Error al registrar usuario en la base de datos' });
                    }
                    res.status(201).json({ 
                        success: true,
                        message: 'Usuario registrado exitosamente', 
                        userId: results.insertId,
                        profile_image_url: profile_image_url,
                        cover_image_url: cover_image_url
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error general en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Login endpoint
app.post('/login', (req, res) => {
    console.log('Intento de login recibido:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }
    
    const query = 'SELECT user_id, username, profile_image_url FROM users WHERE username = ? AND password_hash = ?';
    
    conexion.query(query, [username, password], (error, results) => {
        if (error) {
            console.error('Error en login:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (results.length > 0) {
            const user = results[0];
            return res.json({
                success: true,
                user: {
                    id: user.user_id,
                    username: user.username,
                    profile_image_url: user.profile_image_url
                }
            });
        } else {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
    });
});

// ...existing code...
app.get('/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT user_id, username, email, first_name, last_name, date_of_birth, bio, profile_image_url, cover_image_url
        FROM users WHERE user_id = ?
    `;
    conexion.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error al obtener datos del usuario:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (results.length > 0) {
            const user = results[0];
            return res.json({
                id: user.user_id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                date_of_birth: user.date_of_birth,
                bio: user.bio,
                profile_image_url: user.profile_image_url,
                cover_image_url: user.cover_image_url
            });
        } else {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    });
});
// ...existing code...

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.get('/users', (req, res) => {
    const query = 'SELECT user_id, username, profile_image_url, cover_image_url FROM users';
    conexion.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        res.json(results);
    });
});

// ...existing code...

// ...existing code...

app.post('/update-profile', async (req, res) => {
    try {
        // Los campos de texto llegan en req.body, los archivos en req.files
        const {
            user_id,
            username,
            email,
            first_name,
            last_name,
            date_of_birth,
            bio,
            current_password,
            new_password
        } = req.body;

        if (!user_id) return res.status(400).json({ error: 'ID de usuario requerido' });

        // Verifica la contraseña actual
        const getUserQuery = 'SELECT password_hash FROM users WHERE user_id = ?';
        conexion.query(getUserQuery, [user_id], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Error al verificar usuario' });
            if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

            const dbPassword = results[0].password_hash;
            if (current_password !== dbPassword) {
                return res.status(401).json({ error: 'Contraseña actual incorrecta' });
            }

            // Manejo de imágenes
            let profile_image_url = null;
            let cover_image_url = null;

            if (req.files) {
                if (req.files.profile_image) {
                    const profileImage = req.files.profile_image;
                    if (!profileImage.mimetype.startsWith('image/')) {
                        return res.status(400).json({ error: 'El archivo de perfil debe ser una imagen' });
                    }
                    const profileImageName = `profile_${Date.now()}${path.extname(profileImage.name)}`;
                    const profileImagePath = path.join(__dirname, '../uploads/', profileImageName);
                    await profileImage.mv(profileImagePath);
                    profile_image_url = `/uploads/${profileImageName}`;
                }
                if (req.files.cover_image) {
                    const coverImage = req.files.cover_image;
                    if (!coverImage.mimetype.startsWith('image/')) {
                        return res.status(400).json({ error: 'El archivo de portada debe ser una imagen' });
                    }
                    const coverImageName = `cover_${Date.now()}${path.extname(coverImage.name)}`;
                    const coverImagePath = path.join(__dirname, '../uploads/', coverImageName);
                    await coverImage.mv(coverImagePath);
                    cover_image_url = `/uploads/${coverImageName}`;
                }
            }

            // Construir query dinámico
            let updateFields = [];
            let updateValues = [];

            if (username) { updateFields.push('username = ?'); updateValues.push(username); }
            if (email) { updateFields.push('email = ?'); updateValues.push(email); }
            if (first_name) { updateFields.push('first_name = ?'); updateValues.push(first_name); }
            if (last_name) { updateFields.push('last_name = ?'); updateValues.push(last_name); }
            if (date_of_birth) { updateFields.push('date_of_birth = ?'); updateValues.push(date_of_birth); }
            if (bio !== undefined) { updateFields.push('bio = ?'); updateValues.push(bio); }
            if (profile_image_url) { updateFields.push('profile_image_url = ?'); updateValues.push(profile_image_url); }
            if (cover_image_url) { updateFields.push('cover_image_url = ?'); updateValues.push(cover_image_url); }
            if (new_password) { updateFields.push('password_hash = ?'); updateValues.push(new_password); }

            if (updateFields.length === 0) {
                return res.status(400).json({ error: 'No hay datos para actualizar' });
            }

            updateValues.push(user_id);

            const updateQuery = `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = ?`;
            conexion.query(updateQuery, updateValues, (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'El usuario o correo electrónico ya existe' });
                    }
                    return res.status(500).json({ error: 'Error al actualizar el perfil' });
                }
                res.json({
                    success: true,
                    username,
                    profile_image_url,
                    cover_image_url
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ...existing code...