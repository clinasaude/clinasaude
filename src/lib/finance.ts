export const PLATFORM_FEE = 0.2;
export const PRO_PREMIUM_PRICE = 59.9;
export const PATIENT_PLUS_PRICE = 19.9;

/** Split de consulta: 20% CLINA, 80% profissional (antes de taxas externas). */
export function splitConsultation(amount: number, fee = PLATFORM_FEE) {
  const platform = Math.round(amount * fee * 100) / 100;
  return { platform, professional: Math.round((amount - platform) * 100) / 100 };
}

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });