export type ClinaAppointment={id:string;patient_id:string;professional_id:string;slot_id:string;starts_at:string;ends_at:string;status:string;price_cents:number;meeting_url:string|null};
export type ClinaDiaryEntry={id:string;patient_id:string;mood:number;note:string|null;created_at:string;entry_date:string;emoji:string|null};
export type ClinaClinicalRecord={id:string;appointment_id:string;patient_id:string;professional_id:string;record_type:string;title:string;content:string;created_at:string;updated_at:string|null};
export type ClinaTransaction={id:string;appointment_id:string;gross_amount_cents:number;platform_fee_cents:number;professional_payout_cents:number;payout_status:string;created_at:string};
export type ClinaSlot={id:string;professional_id:string;starts_at:string;ends_at:string;is_available:boolean};
export type PendingProfessional={user_id:string;public_name:string;category:string;registration_type:string;registration_number:string;biography:string|null;specialties:string[];status:string;created_at:string};
