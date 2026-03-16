import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPT_IA = `Você analisa pagamentos de aluguel residencial. Vencimento: dia 6 de cada mês. Multa por atraso: 10% sobre o valor. Regras de status: OK (pago até dia 6), ATRASADO (pago após dia 6), PARCIAL (valor menor que 500 reais), NAO_ALUGUEL (valor maior que 5000 reais), DUPLICADO (mesmo nome aparece mais de uma vez no array recebido). Prioridade: CRITICO para PARCIAL ou DUPLICADO, ATENCAO para ATRASADO, NORMAL para os demais. Retorne APENAS um array JSON com os mesmos ids recebidos acrescidos dos campos: status, dias_atraso, multa_devida, observacao, acao_recomendada, prioridade. Nenhum texto fora do JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { pagamentos } = await req.json();
    if (!pagamentos?.length) throw new Error("Nenhum pagamento recebido.");

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: PROMPT_IA,
        messages: [{ role: "user", content: JSON.stringify(pagamentos) }],
      }),
    });

    if (!resp.ok) throw new Error(`Anthropic API error: ${resp.status}`);
    const data = await resp.json();
    const texto = (data.content?.[0]?.text ?? "").replace(/```json|```/g, "").trim();
    const resultado = JSON.parse(texto);

    return new Response(JSON.stringify({ resultado }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
