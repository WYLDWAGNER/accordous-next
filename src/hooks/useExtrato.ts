import { useState } from "react";
import { parseExtrato, prepararPayloadIA, aplicarRespostaIA, type LinhaParsed, type RespostaIA } from "@/lib/parseExtrato";
import { supabase } from "@/integrations/supabase/client";

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
      const payload = prepararPayloadIA(parsed);
      const pagamentos = JSON.parse(payload);

      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "analisar-extrato",
        { body: { pagamentos } }
      );

      if (fnError) throw new Error(fnError.message);
      const respostas: RespostaIA[] = fnData.resultado;
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
