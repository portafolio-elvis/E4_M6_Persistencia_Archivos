const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Ruta GET /
app.get("/", (req, res) => {
  try {
    const data = fs.readFileSync("mensajes.json", "utf-8");
    const mensajes = JSON.parse(data);
    let html = fs.readFileSync(
      path.join(__dirname, "public", "index.html"),
      "utf-8",
    );

    let mensajesHTML = "";

    if (mensajes.length === 0) {
      mensajesHTML = "<p>No hay mensajes todavía.</p>";
    } else {
      mensajes.forEach((msg) => {
        mensajesHTML += `
                    <div class="mensaje">
                        <div class="usuario">${msg.usuario}</div>
                        <div class="texto">${msg.mensaje}</div>
                    </div>
                `;
      });
    }

    html = html.replace(
      '<div id="mensajes-container">',
      `<div id="mensajes-container">${mensajesHTML}`,
    );

    res.send(html);
  } catch (error) {
    console.error("Error al leer mensajes:", error);
    res.status(500).send("Error al cargar los mensajes");
  }
});

// Ruta POST /nuevo-mensaje
app.post("/nuevo-mensaje", (req, res) => {
  try {
    const { usuario, mensaje } = req.body;

    if (!usuario || !mensaje) {
      return res.status(400).send("Por favor completa todos los campos");
    }

    const data = fs.readFileSync("mensajes.json", "utf-8");
    const mensajes = JSON.parse(data);

    const nuevoMensaje = {
      usuario: usuario.trim(),
      mensaje: mensaje.trim(),
    };

    mensajes.push(nuevoMensaje);

    const jsonString = JSON.stringify(mensajes, null, 2);
    fs.writeFileSync("mensajes.json", jsonString);

    console.log("Nuevo mensaje guardado");

    res.redirect("/");
  } catch (error) {
    console.error("Error al guardar mensaje:", error);
    res.status(500).send("Error al guardar el mensaje");
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:" + PORT);
});
