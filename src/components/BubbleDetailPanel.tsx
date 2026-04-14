import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Calendar, ExternalLink, Trash2, ArrowRight, Zap, FileText, Home, ChevronDown, ChevronUp } from "lucide-react";
import type { Contact, Phase, Imovel } from "@/hooks/useContacts";
import { PHASES, PHASE_MAP } from "@/lib/phases";

interface BubbleDetailPanelProps {
  contact: Contact | null;
  onClose: () => void;
  onPhaseChange: (id: string, fase: Phase) => void;
  onDelete: (id: string) => void;
  onToggleAguardando?: (id: string, value: boolean) => void;
  onUpdateSubStatus?: (id: string, subStatus: string | null) => void;
  onUpdateMeetingDate?: (id: string, field: "firstMeetingDate" | "secondMeetingDate", date: string) => void;
  onUpdateNote?: (id: string, notes: string) => void;
  onUpdateImovel?: (id: string, imovel: Imovel) => void;
}

const TIPOS = ["Apartamento", "Casa", "Terreno", "Comercial", "Cobertura", "Studio"];
const AREA_LAZER_OPTS = [
  { value: "nao", label: "Não tem" },
  { value: "semi", label: "Semi" },
  { value: "completa", label: "Completa" },
];

function formatPreco(value: string) {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function precoToNumber(value: string): number | undefined {
  const num = value.replace(/\D/g, "");
  if (!num) return undefined;
  return Number(num) / 100;
}

export function BubbleDetailPanel({
  contact,
  onClose,
  onPhaseChange,
  onDelete,
  onToggleAguardando,
  onUpdateSubStatus,
  onUpdateMeetingDate,
  onUpdateNote,
  onUpdateImovel,
}: BubbleDetailPanelProps) {
  const [editingFirst, setEditingFirst] = useState(false);
  const [editingSecond, setEditingSecond] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(contact?.notes ?? "");
  const [imovelOpen, setImovelOpen] = useState(false);
  const [imovelEditing, setImovelEditing] = useState(false);
  const [imovel, setImovel] = useState<Imovel>({});
  const [precoDisplay, setPrecoDisplay] = useState(
    contact?.imovel_preco
      ? Number(contact.imovel_preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
      : ""
  );

  useEffect(() => {
    setNoteValue(contact?.notes ?? "");
    setEditingNote(false);
    setImovelEditing(false);
    setImovelOpen(false);
    setPrecoDisplay(
      contact?.imovel_preco
        ? Number(contact.imovel_preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
        : ""
    );
    setImovel({
      tipo: contact?.imovel_tipo ?? "",
      bairro: contact?.imovel_bairro ?? "",
      endereco: contact?.imovel_endereco ?? "",
      metragem: contact?.imovel_metragem ?? undefined,
      quartos: contact?.imovel_quartos ?? undefined,
      banheiros: contact?.imovel_banheiros ?? undefined,
      garagem: contact?.imovel_garagem ?? undefined,
      mobiliado: contact?.imovel_mobiliado ?? false,
      elevador: contact?.imovel_elevador ?? false,
      seguranca: contact?.imovel_seguranca ?? false,
      area_lazer: contact?.imovel_area_lazer ?? "nao",
      preco: contact?.imovel_preco ?? undefined,
    });
  }, [contact?.id]);

  if (!contact) return null;
  const config = PHASE_MAP[contact.fase];

  const handleDelete = () => { onDelete(contact.id); onClose(); };

  const initials = contact.nombre.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const hasImovel = contact.imovel_tipo || contact.imovel_bairro || contact.imovel_preco;

  const handleSaveImovel = () => {
    if (onUpdateImovel) {
      onUpdateImovel(contact.id, imovel);
      setImovelEditing(false);
    }
  };

  return (
    <AnimatePresence>
      {contact && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm z-40"
            style={{ background: "hsl(var(--foreground) / 0.08)" }}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.80, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.80, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="glass rounded-2xl shadow-panel w-full max-w-sm pointer-events-auto relative overflow-hidden flex flex-col"
              style={{ border: `1px solid ${config.headerColor}40`, maxHeight: "92vh" }}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${config.headerColor}, ${config.headerColor}88)` }} />

              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-accent transition-colors z-10">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 p-6 pt-7 scrollbar-thin">

                {/* Avatar + Name */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}bb)`, boxShadow: `0 6px 20px ${config.headerColor}55, inset 0 1px 0 rgba(255,255,255,0.25)` }}
                  >
                    {initials || "?"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground leading-tight truncate">{contact.nombre}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}cc)`, boxShadow: `0 2px 8px ${config.headerColor}44` }}>
                      {config.emoji} {config.label}
                    </span>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-2 mb-5">
                  {contact.telefono && (
                    <a href={`tel:${contact.telefono}`} className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-semibold">{contact.telefono}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">{contact.fechaCreacion}</span>
                  </div>
                </div>

                {/* Meeting dates */}
                {onUpdateMeetingDate && (
                  <>
                    <div className="h-px bg-border/60 mb-4" />
                    <div className="mb-4 space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Datas de reunião
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-6">1R</span>
                        {editingFirst ? (
                          <input type="date" autoFocus defaultValue={contact.firstMeetingDate || new Date().toISOString().split("T")[0]}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            onChange={(e) => { if (e.target.value) onUpdateMeetingDate(contact.id, "firstMeetingDate", e.target.value); }}
                            onBlur={() => setEditingFirst(false)} />
                        ) : (
                          <button onClick={() => setEditingFirst(true)}
                            className={`flex-1 text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${contact.firstMeetingDate ? "border-border text-foreground font-medium hover:border-primary/50 hover:bg-primary/5" : "border-dashed border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"}`}>
                            {contact.firstMeetingDate || "— sem data —"}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-6">2R</span>
                        {editingSecond ? (
                          <input type="date" autoFocus defaultValue={contact.secondMeetingDate || new Date().toISOString().split("T")[0]}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            onChange={(e) => { if (e.target.value) onUpdateMeetingDate(contact.id, "secondMeetingDate", e.target.value); }}
                            onBlur={() => setEditingSecond(false)} />
                        ) : (
                          <button onClick={() => setEditingSecond(true)}
                            className={`flex-1 text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${contact.secondMeetingDate ? "border-border text-foreground font-medium hover:border-primary/50 hover:bg-primary/5" : "border-dashed border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"}`}>
                            {contact.secondMeetingDate || "— sem data —"}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-border/60 mb-4" />

                {/* Imóvel section */}
                <div className="mb-4">
                  <button
                    onClick={() => setImovelOpen(!imovelOpen)}
                    className="w-full flex items-center justify-between group"
                  >
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Home className="w-3 h-3" /> Imóvel
                      {hasImovel && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}cc)` }}>
                          ✓
                        </span>
                      )}
                    </p>
                    {imovelOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>

                  <AnimatePresence>
                    {imovelOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-3">
                          {!imovelEditing ? (
                            /* VIEW MODE */
                            <div className="space-y-2">
                              {contact.imovel_preco && (
                                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2.5 border border-emerald-200/60 dark:border-emerald-800/40">
                                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Preço</span>
                                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                                    R$ {Number(contact.imovel_preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2">
                                {contact.imovel_tipo && (
                                  <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border/50">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Tipo</p>
                                    <p className="text-xs font-semibold text-foreground">{contact.imovel_tipo}</p>
                                  </div>
                                )}
                                {contact.imovel_bairro && (
                                  <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border/50">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Bairro</p>
                                    <p className="text-xs font-semibold text-foreground truncate">{contact.imovel_bairro}</p>
                                  </div>
                                )}
                                {contact.imovel_metragem && (
                                  <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border/50">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Metragem</p>
                                    <p className="text-xs font-semibold text-foreground">{contact.imovel_metragem} m²</p>
                                  </div>
                                )}
                                {contact.imovel_quartos && (
                                  <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border/50">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Quartos</p>
                                    <p className="text-xs font-semibold text-foreground">{contact.imovel_quartos} 🛏</p>
                                  </div>
                                )}
                                {contact.imovel_banheiros && (
                                  <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border/50">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Banheiros</p>
                                    <p className="text-xs font-semibold text-foreground">{contact.imovel_banheiros} 🚿</p>
                                  </div>
                                )}
                                {contact.imovel_garagem !== undefined && contact.imovel_garagem !== null && (
                                  <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border/50">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Garagem</p>
                                    <p className="text-xs font-semibold text-foreground">{contact.imovel_garagem} vaga(s) 🚗</p>
                                  </div>
                                )}
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap gap-1.5">
                                {contact.imovel_mobiliado && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">🛋 Mobiliado</span>}
                                {contact.imovel_elevador && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">🛗 Elevador</span>}
                                {contact.imovel_seguranca && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">🔒 Segurança</span>}
                                {contact.imovel_area_lazer && contact.imovel_area_lazer !== "nao" && (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    🏊 Lazer {contact.imovel_area_lazer === "completa" ? "completa" : "semi"}
                                  </span>
                                )}
                              </div>

                              {contact.imovel_endereco && (
                                <div className="bg-muted/40 rounded-xl px-3 py-2 border border-border/50">
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Endereço</p>
                                  <p className="text-xs text-foreground">{contact.imovel_endereco}</p>
                                </div>
                              )}

                              {!hasImovel && (
                                <p className="text-xs text-muted-foreground text-center py-2">Nenhum dado cadastrado</p>
                              )}

                              <button
                                onClick={() => setImovelEditing(true)}
                                className="w-full text-xs px-3 py-2 rounded-xl border border-dashed border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                              >
                                {hasImovel ? "✏️ Editar dados do imóvel" : "＋ Adicionar dados do imóvel"}
                              </button>
                            </div>
                          ) : (
                            /* EDIT MODE */
                            <div className="space-y-3">
                              {/* Tipo */}
                              <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Tipo</label>
                                <div className="flex flex-wrap gap-1.5">
                                  {TIPOS.map((t) => (
                                    <button key={t} type="button"
                                      onClick={() => setImovel((p) => ({ ...p, tipo: p.tipo === t ? "" : t }))}
                                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${imovel.tipo === t ? "text-white border-transparent" : "border-border text-muted-foreground hover:border-primary/50"}`}
                                      style={imovel.tipo === t ? { background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}cc)` } : {}}
                                    >{t}</button>
                                  ))}
                                </div>
                              </div>

                              {/* Preço */}
                              <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Preço</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">R$</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={precoDisplay}
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(/\D/g, "");
                                      if (!raw) { setPrecoDisplay(""); setImovel((p) => ({ ...p, preco: undefined })); return; }
                                      const num = Number(raw) / 100;
                                      setPrecoDisplay(num.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
                                      setImovel((p) => ({ ...p, preco: num }));
                                    }}
                                    placeholder="0,00"
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                              </div>

                              {/* Bairro + Endereço */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Bairro</label>
                                  <input type="text" value={imovel.bairro ?? ""} onChange={(e) => setImovel((p) => ({ ...p, bairro: e.target.value }))}
                                    placeholder="Ex: Manaíra"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Metragem (m²)</label>
                                  <input type="number" value={imovel.metragem ?? ""} onChange={(e) => setImovel((p) => ({ ...p, metragem: e.target.value ? Number(e.target.value) : undefined }))}
                                    placeholder="Ex: 85"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                              </div>

                              {/* Quartos / Banheiros / Garagem */}
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: "Quartos 🛏", key: "quartos" },
                                  { label: "Banheiros 🚿", key: "banheiros" },
                                  { label: "Garagem 🚗", key: "garagem" },
                                ].map(({ label, key }) => (
                                  <div key={key}>
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
                                    <input type="number" min="0" max="20"
                                      value={(imovel as Record<string, unknown>)[key] as number ?? ""}
                                      onChange={(e) => setImovel((p) => ({ ...p, [key]: e.target.value ? Number(e.target.value) : undefined }))}
                                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                                  </div>
                                ))}
                              </div>

                              {/* Endereço */}
                              <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Endereço completo</label>
                                <input type="text" value={imovel.endereco ?? ""} onChange={(e) => setImovel((p) => ({ ...p, endereco: e.target.value }))}
                                  placeholder="Rua, número, complemento..."
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                              </div>

                              {/* Toggles */}
                              <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-2">Características</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { key: "mobiliado", label: "🛋 Mobiliado" },
                                    { key: "elevador", label: "🛗 Elevador" },
                                    { key: "seguranca", label: "🔒 Segurança" },
                                  ].map(({ key, label }) => (
                                    <button key={key} type="button"
                                      onClick={() => setImovel((p) => ({ ...p, [key]: !(p as Record<string, unknown>)[key] }))}
                                      className={`px-2 py-2 rounded-xl text-[10px] font-semibold border transition-colors text-center ${(imovel as Record<string, unknown>)[key] ? "text-white border-transparent" : "border-border text-muted-foreground"}`}
                                      style={(imovel as Record<string, unknown>)[key] ? { background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}cc)` } : {}}
                                    >{label}</button>
                                  ))}
                                </div>
                              </div>

                              {/* Área de lazer */}
                              <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">🏊 Área de lazer</label>
                                <div className="flex gap-1.5">
                                  {AREA_LAZER_OPTS.map(({ value, label }) => (
                                    <button key={value} type="button"
                                      onClick={() => setImovel((p) => ({ ...p, area_lazer: value }))}
                                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors ${imovel.area_lazer === value ? "text-white border-transparent" : "border-border text-muted-foreground"}`}
                                      style={imovel.area_lazer === value ? { background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}cc)` } : {}}
                                    >{label}</button>
                                  ))}
                                </div>
                              </div>

                              {/* Save/Cancel */}
                              <div className="flex gap-2 pt-1">
                                <button onClick={handleSaveImovel}
                                  className="flex-1 py-2.5 rounded-xl pill-gradient text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity">
                                  Salvar imóvel
                                </button>
                                <button onClick={() => setImovelEditing(false)}
                                  className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground text-xs font-semibold hover:bg-accent transition-colors">
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-border/60 mb-4" />

                {/* Notes */}
                {onUpdateNote && (
                  <>
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Anotações
                      </p>
                      {editingNote ? (
                        <div className="space-y-2">
                          <textarea autoFocus value={noteValue} onChange={(e) => setNoteValue(e.target.value)} rows={4}
                            placeholder="Escreva suas anotações sobre este contato..."
                            className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50" />
                          <div className="flex gap-1.5">
                            <button onClick={() => { onUpdateNote(contact.id, noteValue); setEditingNote(false); }}
                              className="flex-1 text-xs px-3 py-1.5 rounded-lg pill-gradient text-white font-bold shadow-sm hover:opacity-90 transition-opacity">
                              Salvar
                            </button>
                            <button onClick={() => { setNoteValue(contact.notes ?? ""); setEditingNote(false); }}
                              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setNoteValue(contact.notes ?? ""); setEditingNote(true); }}
                          className={`w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-colors min-h-[60px] ${contact.notes ? "border-border text-foreground bg-muted/30 hover:bg-muted/50" : "border-dashed border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"}`}>
                          {contact.notes || "Clique para adicionar uma anotação..."}
                        </button>
                      )}
                    </div>
                    <div className="h-px bg-border/60 mb-4" />
                  </>
                )}

                {/* Phase change */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Cambiar fase
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PHASES.map((p) => (
                      <button key={p.key} onClick={() => { onPhaseChange(contact.id, p.key); onClose(); }}
                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full font-bold transition-all duration-150 ${contact.fase === p.key ? "text-white scale-105 shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        style={contact.fase === p.key ? { background: `linear-gradient(135deg, ${p.headerColor}, ${p.headerColor}cc)`, boxShadow: `0 2px 10px ${p.headerColor}44` } : {}}>
                        {p.emoji} {p.label}
                        {contact.fase === p.key && <ArrowRight className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aguardando Resposta */}
                {onToggleAguardando && (
                  <button onClick={() => onToggleAguardando(contact.id, !contact.aguardandoResposta)}
                    className={`w-full mb-3 text-xs px-3 py-2 rounded-xl border font-semibold transition-colors ${contact.aguardandoResposta ? "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800" : "border-border text-muted-foreground hover:border-rose-300 hover:text-rose-500"}`}>
                    {contact.aguardandoResposta ? "💓 Aguardando Resposta" : "⏳ Marcar como Aguardando Resposta"}
                  </button>
                )}

                {onUpdateSubStatus && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <span>⚡</span> Status pendente
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: "aguardando_documentacao", label: "📄 Aguardando Doc." },
                        { key: "aguardando_visita",       label: "🏠 Aguardando Visita" },
                        { key: "aguardando_proposta",     label: "📝 Aguardando Proposta" },
                        { key: "aguardando_retorno",      label: "📞 Aguardando Retorno" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => onUpdateSubStatus(contact.id, contact.subStatus === opt.key ? null : opt.key)}
                          className={`text-[11px] px-2.5 py-1.5 rounded-full font-bold border transition-all ${
                            contact.subStatus === opt.key
                              ? "bg-amber-400 text-white border-transparent shadow-sm scale-105"
                              : "bg-muted text-muted-foreground border-border hover:border-amber-300 hover:text-amber-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {contact.trelloUrl ? (
                    <a href={contact.trelloUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl pill-gradient text-white text-xs font-bold shadow-bubble hover:opacity-90 transition-opacity">
                      <ExternalLink className="w-3.5 h-3.5" /> Ver en Trello
                    </a>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed">
                      <ExternalLink className="w-3.5 h-3.5" /> Trello (pendiente)
                    </div>
                  )}
                  <button onClick={handleDelete}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-destructive/8 text-destructive text-xs font-semibold hover:bg-destructive hover:text-white transition-all duration-150">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Apagar</span>
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
