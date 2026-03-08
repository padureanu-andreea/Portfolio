const cors = require('cors');
const express = require("express");
const { sequelize } = require("./models"); // Asigură-te că models/index.js folosește config/db.js

// Import rute
const inventoryRoutes = require("./routes/inventoryRoutes");
const claimRoutes = require("./routes/claimRoutes");
const integrationRoutes = require("./routes/integrationRoutes");
const authRouter = require("./routes/authRouter");
const productRouter = require("./routes/productRouter");
const feedRouter = require("./routes/feedRouter");
const groupRouter = require("./routes/groupRouter");
const debugGroupRouter = require("./routes/debugGroupRouter");
const tagRoutes = require("./routes/tagRoutes");

const app = express();

// Portul 8080 este cel standard pentru Railway
const port = process.env.PORT || 8080;

// Configurare CORS pentru a permite cererile de pe Vercel și Railway
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.includes('vercel.app') || origin.includes('railway.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definire rute
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/feed", feedRouter);
app.use("/groups", groupRouter);
app.use("/debug", debugGroupRouter);
app.use('/inventory', inventoryRoutes);
app.use('/claims', claimRoutes);
app.use('/integrations', integrationRoutes);
app.use("/tags", tagRoutes);

// Rută de bază pentru testarea conexiunii
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend-ul AntiFoodWaste este online și sincronizat pe Railway!" });
});

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error("Eroare Server:", err.message);
  res.status(500).json({ 
    message: "Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : "A apărut o eroare internă." 
  });
});

// Funcție asincronă pentru a porni baza de date înainte de server
const startServer = async () => {
  try {
    // 1. Verificăm conexiunea la Postgres
    await sequelize.authenticate();
    console.log('Conexiunea la baza de date Railway a fost stabilită.');

    // 2. Sincronizăm tabelele (le creează automat dacă nu există)
    await sequelize.sync({ alter: true });
    console.log('Toate tabelele au fost sincronizate.');

    // 3. Pornim serverul doar după ce DB este gata
    app.listen(port, () => {
      console.log(`Serverul rulează pe portul ${port}`);
    });
  } catch (error) {
    console.error('Eroare critică la pornire:', error);
    // Închidem procesul dacă nu se poate conecta la DB pentru a evita erori ulterioare
    process.exit(1); 
  }
};

startServer();