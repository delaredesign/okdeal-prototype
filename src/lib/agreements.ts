import type { DealDraft } from '../domain/draft'
import { supabase } from './supabase'

export type AgreementSummary = {
  id: string; okdeal_id: string; status: string; intended_recipient_name: string
  created_at: string; agreement_versions: { title: string; amount_minor: number; currency: string }[]
}

export async function createAgreement(draft: DealDraft) {
  const { data, error } = await supabase.rpc('create_agreement', {
    p_recipient_name: draft.recipientName.trim(), p_recipient_email: draft.recipientEmail.trim().toLowerCase(),
    p_recipient_phone: draft.phone.trim() || null, p_title: draft.title.trim(), p_description: draft.description.trim(),
    p_amount_minor: Math.round(Number(draft.amount) * 100), p_currency: 'MYR', p_start_date: draft.startDate,
    p_completion_date: draft.completionDate, p_payment_terms: draft.paymentTerms.trim(),
    p_additional_terms: draft.additionalTerms.trim() || null,
  })
  if (error) throw error
  return data as { id: string; okdeal_id: string; share_token: string }
}

export async function listAgreements() {
  const { data, error } = await supabase.from('agreements').select('id,okdeal_id,status,intended_recipient_name,created_at,agreement_versions(title,amount_minor,currency)').order('created_at', { ascending: false })
  if (error) throw error
  return data as AgreementSummary[]
}

export async function getSharedAgreement(token: string, email: string) {
  const { data, error } = await supabase.rpc('get_shared_agreement', { p_share_token: token, p_recipient_email: email.trim().toLowerCase() })
  if (error) throw error
  return data as null | Record<string, string | number | null>
}
