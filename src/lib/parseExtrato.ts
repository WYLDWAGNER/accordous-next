import * as XLSX from "xlsx";

export type StatusBaixa = "OK" | "ATRASADO" | "PARCIAL" | "DUPLICADO" | "NAO_ALUGUEL" | "PENDENTE_IA";
export type Prioridade = "NORMAL" | "ATENCAO" | "CRITICO";

export interface LinhaParsed {
  id: string;
  data_banco: string;
  lancamento: string;
  nome: string;
  nome_limpo: string;
  data_pix: string;
  dcto: string;
  credito: number | null;
  debito: number | null;
  saldo: number | null;
  status: StatusBaixa;
  dias_atraso: number;
  multa_devida: number;
  observacao: string;
  acao_recomendada: string;
  prioridade: Prioridade;
  baixa_realizada: boolean;
  responsavel: string;
}

export interface RespostaIA {
  id: string;
  status: StatusBaixa;
  dias_atraso: number;
  multa_devida: number;
  observacao: string;
  acao_recomendada: string;
  prioridade: Prioridade;
}
