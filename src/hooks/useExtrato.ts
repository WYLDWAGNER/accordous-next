import { useState } from "react";
import { parseExtrato, prepararPayloadIA, aplicarRespostaIA, type LinhaParsed, type RespostaIA } from "@/lib/parseExtrato";

const PROMPT_IA = `Você analisa pagamentos de aluguel. Vencimento: dia 6. Multa atraso: 10%. Regras de status: OK (pago até dia 6), ATRASADO (após dia 6), PARCIAL (valor < 500), NAO_ALUGUEL (valor > 5000), DUPLICADO (mesmo nome aparece 2x). Prioridade: CRITICO=PARCIAL ou DUPLICADO, ATENCAO=ATRASADO, NORMAL=outros. Retorne APENAS array JSON com os mesmos ids mais os campos: status, dias_atraso, multa_devida, observacao, acao_recomendada, prioridade.`;

export function useExtrato() {
  const [linhas, setLinhas] = useState<LinhaParsed[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<"idle"|"parse"|"ia"|"revisao">("idle");

  async function importarArquivo(file: File) {
    setErro(null); setCarregando(true);
    try {
      setEtapa("parse");
      const parsed = await parseExtrato(file);
      setLinhas(parsed);

      setEtapa("ia");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: PROMPT_IA,
          messages: [{ role: "user", content: prepararPayloadIA(parsed) }],
        }),
      });
      if (!resp.ok) throw new Error(`Erro API: ${resp.status}`);
      const data = await resp.json();
      const texto = (data.content?.[0]?.text ?? "").replace(/```json|```/g, "").trim();
      const respostas: RespostaIA[] = JSON.parse(texto);
      setLinhas(aplicarRespostaIA(parsed, respostas));
      setEtapa("revisao");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
      setEtapa("idle");
    } finally {
      setCarregando(false);
    }
  }

  function atualizarLinha(id: string, campos: Partial<LinhaParsed>) {
    setLinhas((prev) => prev.map((l) => l.id === id ? { ...l, ...campos } : l));
  }

  const resumo = {
    total: linhas.length,
    criticos: linhas.filter((l) => l.prioridade === "CRITICO").length,
    comMulta: linhas.filter((l) => l.multa_devida > 0).length,
    totalMultas: linhas.reduce((acc, l) => acc + l.multa_devida, 0),
    baixasFeitas: linhas.filter((l) => l.baixa_realizada).length,
  };

  return { linhas, carregando, erro, etapa, resumo, importarArquivo, atualizarLinha };
}
