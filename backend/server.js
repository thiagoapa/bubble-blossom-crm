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
    const { etapa, firstMeetingDate, secondMeetingDate, aguardandoResposta, notes,
      imovel_tipo, imovel_bairro, imovel_endereco, imovel_lat, imovel_lng,
      imovel_metragem, imovel_quartos, imovel_banheiros, imovel_garagem,
      imovel_mobiliado, imovel_elevador, imovel_seguranca, imovel_area_lazer, imovel_preco
    } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    if (etapa !== undefined)              { fields.push(`etapa=$${i++}`);               values.push(etapa); }
    if (firstMeetingDate !== undefined)   { fields.push(`first_meeting_date=$${i++}`);  values.push(firstMeetingDate || null); }
    if (secondMeetingDate !== undefined)  { fields.push(`second_meeting_date=$${i++}`); values.push(secondMeetingDate || null); }
    if (aguardandoResposta !== undefined) { fields.push(`aguardando_resposta=$${i++}`); values.push(aguardandoResposta); }
    if (notes !== undefined)              { fields.push(`notes=$${i++}`);               values.push(notes || null); }
    if (imovel_tipo !== undefined)        { fields.push(`imovel_tipo=$${i++}`);         values.push(imovel_tipo || null); }
    if (imovel_bairro !== undefined)      { fields.push(`imovel_bairro=$${i++}`);       values.push(imovel_bairro || null); }
    if (imovel_endereco !== undefined)    { fields.push(`imovel_endereco=$${i++}`);     values.push(imovel_endereco || null); }
    if (imovel_lat !== undefined)         { fields.push(`imovel_lat=$${i++}`);          values.push(imovel_lat ?? null); }
    if (imovel_lng !== undefined)         { fields.push(`imovel_lng=$${i++}`);          values.push(imovel_lng ?? null); }
    if (imovel_metragem !== undefined)    { fields.push(`imovel_metragem=$${i++}`);     values.push(imovel_metragem ?? null); }
    if (imovel_quartos !== undefined)     { fields.push(`imovel_quartos=$${i++}`);      values.push(imovel_quartos ?? null); }
    if (imovel_banheiros !== undefined)   { fields.push(`imovel_banheiros=$${i++}`);    values.push(imovel_banheiros ?? null); }
    if (imovel_garagem !== undefined)     { fields.push(`imovel_garagem=$${i++}`);      values.push(imovel_garagem ?? null); }
    if (imovel_mobiliado !== undefined)   { fields.push(`imovel_mobiliado=$${i++}`);    values.push(imovel_mobiliado ?? false); }
    if (imovel_elevador !== undefined)    { fields.push(`imovel_elevador=$${i++}`);     values.push(imovel_elevador ?? false); }
    if (imovel_seguranca !== undefined)   { fields.push(`imovel_seguranca=$${i++}`);    values.push(imovel_seguranca ?? false); }
    if (imovel_area_lazer !== undefined)  { fields.push(`imovel_area_lazer=$${i++}`);   values.push(imovel_area_lazer ?? "nao"); }
    if (imovel_preco !== undefined)       { fields.push(`imovel_preco=$${i++}`);        values.push(imovel_preco ?? null); }

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
