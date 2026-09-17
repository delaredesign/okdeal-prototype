export type DealDraft = {
  recipientName: string
  recipientEmail: string
  phone: string
  title: string
  description: string
  amount: string
  startDate: string
  completionDate: string
  paymentTerms: string
  additionalTerms: string
}

export const initialDraft: DealDraft = {
  recipientName: '', recipientEmail: '', phone: '', title: '', description: '',
  amount: '', startDate: '', completionDate: '', paymentTerms: '', additionalTerms: '',
}

export type DraftErrors = Partial<Record<keyof DealDraft, string>>

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function validateDraft(draft: DealDraft): DraftErrors {
  const errors: DraftErrors = {}
  const required: (keyof DealDraft)[] = ['recipientName', 'recipientEmail', 'title', 'description', 'paymentTerms']
  for (const field of required) {
    if (!draft[field].trim()) errors[field] = 'Please complete this field.'
  }
  if (draft.recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.recipientEmail.trim())) {
    errors.recipientEmail = 'Enter a valid email address.'
  }
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(draft.amount) || Number(draft.amount) <= 0) {
    errors.amount = 'Enter an amount above RM 0, with up to two decimal places (for example, 3500.00).'
  }
  if (!validDate(draft.startDate)) errors.startDate = 'Choose a valid start date.'
  if (!validDate(draft.completionDate)) errors.completionDate = 'Choose a valid completion date.'
  if (!errors.startDate && !errors.completionDate && draft.completionDate < draft.startDate) {
    errors.completionDate = 'Completion must be on or after the start date.'
  }
  const limits: Partial<Record<keyof DealDraft, number>> = {
    recipientName: 120, recipientEmail: 254, phone: 40, title: 200,
    description: 10000, paymentTerms: 5000, additionalTerms: 10000,
  }
  for (const [field, limit] of Object.entries(limits)) {
    if (draft[field as keyof DealDraft].length > limit) errors[field as keyof DealDraft] = `Use ${limit} characters or fewer.`
  }
  return errors
}
