import { describe, it, expect } from "vitest";
import { splitConsultation, PRO_PREMIUM_PRICE } from "./finance";

describe("split de comissão", () => {
  it("consulta de R$150 gera R$30 para CLINA e R$120 para o profissional", () => {
    expect(splitConsultation(150)).toEqual({ platform: 30, professional: 120 });
  });
  it("Premium profissional custa R$ 59,90", () => {
    expect(PRO_PREMIUM_PRICE).toBe(59.9);
  });
});