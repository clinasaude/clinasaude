// Static filter vocabulary only. All people, appointments, ratings and activity come from Supabase.
export type Professional = {
  id: string; user_id: string; public_name: string; category: string;
  registration_type: string; registration_number: string; registration_state: string | null;
  biography: string | null; specialties: string[]; approaches: string[]; audiences: string[];
  session_price_cents: number; session_duration_minutes: number; rating: number | null; reviews_count: number;
};
export const specialties = ["Ansiedade","Depressão","Burnout","Luto","Relacionamentos","TDAH","Autoestima","Insônia"];
export const approaches = ["TCC","ACT","Psicanálise","Sistêmica","Psiquiatria integrativa","Psiquiatria infantojuvenil"];
export const audiences = ["Crianças","Adolescentes","Adultos","Idosos","Casais"];
