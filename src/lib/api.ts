const API_URL = "/api";
export async function getContacts() {
  const res = await fetch(`${API_URL}/contacts`);
  return res.json();
}

export async function createContact(nombre: string) {
  const res = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre,
      etapa: "novos"
    })
  });

  return res.json();
}

export async function updateContact(id: number, etapa: string) {
  const res = await fetch(`${API_URL}/contact/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ etapa })
  });

  return res.json();
}
