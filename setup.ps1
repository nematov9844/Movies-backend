# Loyihani yaratish
New-Item -Path "src/config" -ItemType Directory
New-Item -Path "src/controllers" -ItemType Directory
New-Item -Path "src/models" -ItemType Directory
New-Item -Path "src/routes" -ItemType Directory
New-Item -Path "src/middlewares" -ItemType Directory
New-Item -Path "src/utils" -ItemType Directory

# Muhim fayllarni yaratish
New-Item -Path ".env" -ItemType File
New-Item -Path ".gitignore" -ItemType File
New-Item -Path "README.md" -ItemType File
New-Item -Path "package.json" -ItemType File

New-Item -Path "src/server.js" -ItemType File
New-Item -Path "src/config/db.js" -ItemType File
New-Item -Path "src/controllers/authController.js" -ItemType File
New-Item -Path "src/controllers/movieController.js" -ItemType File
New-Item -Path "src/models/User.js" -ItemType File
New-Item -Path "src/models/Movie.js" -ItemType File
New-Item -Path "src/routes/authRoutes.js" -ItemType File
New-Item -Path "src/routes/movieRoutes.js" -ItemType File
New-Item -Path "src/middlewares/authMiddleware.js" -ItemType File
New-Item -Path "src/utils/generateToken.js" -ItemType File
New-Item -Path "src/utils/hashPassword.js" -ItemType File

Write-Host "Loyiha strukturasi yaratildi! 🚀"
