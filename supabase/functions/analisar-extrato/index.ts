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

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: PROMPT_IA },
          { role: "user", content: JSON.stringify(pagamentos) },
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
        status: 429, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
        status: 402, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI Gateway error:", resp.status, errText);
      throw new Error(`AI Gateway error: ${resp.status}`);
    }

    const data = await resp.json();
    const texto = (data.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
    const resultado = JSON.parse(texto);

    return new Response(JSON.stringify({ resultado }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analisar-extrato error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
