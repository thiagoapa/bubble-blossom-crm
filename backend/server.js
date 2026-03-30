require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// ─── DB ───────────────────────────────────────────────────────────────────────
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

// ─── JWT middleware ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Token requerido" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token inválido" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token expirado o inválido" });
  }
}

// ─── ROUTER /api ──────────────────────────────────────────────────────────────
const api = express.Router();
app.use("/api", api);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
api.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Credenciales requeridas" });
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Credenciales incorrectas" });
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ─── CONTACTS ────────────────────────────────────────────────────────────────
api.get("/contacts", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contacts ORDER BY fecha DESC");
    // Normalize column names to camelCase for the frontend
    const rows = result.rows.map((r) => ({
      ...r,
      firstMeetingDate: r.first_meeting_date
        ? r.first_meeting_date.toISOString().split("T")[0]
        : null,
      secondMeetingDate: r.second_meeting_date
        ? r.second_meeting_date.toISOString().split("T")[0]
        : null,
      aguardandoResposta: r.aguardando_resposta ?? false,
      notes: r.notes ?? null,
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error" });
  }
});

api.post("/contacts", requireAuth, async (req, res) => {
  try {
    const { nombre, telefono, etapa, fecha } = req.body;
    const result = await pool.query(
      "INSERT INTO contacts (nombre, telefono, etapa, fecha) VALUES ($1,$2,$3,$4) RETURNING *",
      [nombre, telefono || null, etapa || "novos", fecha || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error" });
  }
});

api.patch("/contacts/:id", requireAuth, async (req, res) => {
  try {
    const { etapa, firstMeetingDate, secondMeetingDate, aguardandoResposta, notes } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    if (etapa !== undefined)              { fields.push(`etapa=$${i++}`);               values.push(etapa); }
    if (firstMeetingDate !== undefined)   { fields.push(`first_meeting_date=$${i++}`);  values.push(firstMeetingDate || null); }
    if (secondMeetingDate !== undefined)  { fields.push(`second_meeting_date=$${i++}`); values.push(secondMeetingDate || null); }
    if (aguardandoResposta !== undefined) { fields.push(`aguardando_resposta=$${i++}`); values.push(aguardandoResposta); }
    if (notes !== undefined)              { fields.push(`notes=$${i++}`);               values.push(notes || null); }

    if (fields.length === 0) return res.json({ success: true });

    values.push(req.params.id);
    await pool.query(
      `UPDATE contacts SET ${fields.join(", ")} WHERE id=$${i}`,
      values
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error" });
  }
});

api.delete("/contacts/:id", requireAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM contacts WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error" });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(4000, "0.0.0.0", () => {
  console.log("CRM API running on port 4000");
});
