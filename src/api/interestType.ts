import type { HubType } from '../constants/events'
import type { InterestType } from './types'

export function hubTypeToInterestType(hubType: HubType): InterestType {
  switch (hubType) {
    case 'product': return 'PRODUCT_UNDERSTANDING'
    case 'fit': return 'FIT_PREFERENCE'
    case 'purchase': return 'PURCHASE_CONDITION'
    case 'other': return 'OTHER'
  }
}
