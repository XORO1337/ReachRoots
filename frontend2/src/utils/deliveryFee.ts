/**
 * Dynamic Delivery Fee Structure with Smart Recommendations
 * 
 * Fee Tiers:
 * - Orders below ₹199 → Delivery Fee: ₹39
 * - Orders ₹199 to ₹998 → Delivery Fee: ₹29
 * - Orders ₹599 and above → Delivery Fee: FREE (₹0)
 */

export interface DeliveryFeeInfo {
  fee: number;
  tier: 'high' | 'medium' | 'free';
  tierColor: string;
  nextTierThreshold: number | null;
  amountToNextTier: number;
  savingsAtNextTier: number;
  savingsPercentage: number;
  progressPercentage: number;
  message: string;
  tipMessage: string | null;
}

export const DELIVERY_THRESHOLDS = {
  FREE_DELIVERY: 599,
  REDUCED_FEE: 199,
} as const;

export const DELIVERY_FEES = {
  HIGH: 39,    // < ₹199
  MEDIUM: 29,  // ₹199 - ₹998
  FREE: 0,     // ≥ ₹599
} as const;

/**
 * Calculate delivery fee and related information based on cart subtotal
 */
export function calculateDeliveryFee(subtotal: number): DeliveryFeeInfo {
  // Tier: FREE (≥ ₹599)
  if (subtotal >= DELIVERY_THRESHOLDS.FREE_DELIVERY) {
    return {
      fee: DELIVERY_FEES.FREE,
      tier: 'free',
      tierColor: 'text-green-600',
      nextTierThreshold: null,
      amountToNextTier: 0,
      savingsAtNextTier: 0,
      savingsPercentage: 100,
      progressPercentage: 100,
      message: '✅ Congratulations! You\'ve unlocked FREE Delivery! 🎉',
      tipMessage: null,
    };
  }

  // Tier: MEDIUM (₹199 - ₹998)
  if (subtotal >= DELIVERY_THRESHOLDS.REDUCED_FEE) {
    const amountToFree = DELIVERY_THRESHOLDS.FREE_DELIVERY - subtotal;
    const progressToFree = (subtotal / DELIVERY_THRESHOLDS.FREE_DELIVERY) * 100;
    
    return {
      fee: DELIVERY_FEES.MEDIUM,
      tier: 'medium',
      tierColor: 'text-orange-500',
      nextTierThreshold: DELIVERY_THRESHOLDS.FREE_DELIVERY,
      amountToNextTier: amountToFree,
      savingsAtNextTier: DELIVERY_FEES.MEDIUM,
      savingsPercentage: 100,
      progressPercentage: Math.min(progressToFree, 99),
      message: `🚚 Delivery Fee: ₹${DELIVERY_FEES.MEDIUM}`,
      tipMessage: `💡 You're close! Add ₹${Math.ceil(amountToFree).toLocaleString()} more to unlock FREE delivery and save ₹${DELIVERY_FEES.MEDIUM}!`,
    };
  }

  // Tier: HIGH (< ₹199)
  const amountToReduced = DELIVERY_THRESHOLDS.REDUCED_FEE - subtotal;
  const amountToFree = DELIVERY_THRESHOLDS.FREE_DELIVERY - subtotal;
  const progressToReduced = (subtotal / DELIVERY_THRESHOLDS.REDUCED_FEE) * 100;
  const savingsPercentage = ((DELIVERY_FEES.HIGH - DELIVERY_FEES.MEDIUM) / DELIVERY_FEES.HIGH) * 100;

  return {
    fee: DELIVERY_FEES.HIGH,
    tier: 'high',
    tierColor: 'text-red-500',
    nextTierThreshold: DELIVERY_THRESHOLDS.REDUCED_FEE,
    amountToNextTier: amountToReduced,
    savingsAtNextTier: DELIVERY_FEES.HIGH - DELIVERY_FEES.MEDIUM,
    savingsPercentage: savingsPercentage,
    progressPercentage: Math.min(progressToReduced, 99),
    message: `🚚 Delivery Fee: ₹${DELIVERY_FEES.HIGH}`,
    tipMessage: `💡 Add ₹${Math.ceil(amountToReduced).toLocaleString()} more to reduce delivery fee by ${savingsPercentage.toFixed(1)}%! Or add ₹${Math.ceil(amountToFree).toLocaleString()} for FREE delivery!`,
  };
}

/**
 * Get tier-specific styling classes
 */
export function getDeliveryTierStyles(tier: DeliveryFeeInfo['tier']) {
  switch (tier) {
    case 'free':
      return {
        badgeClass: 'bg-green-100 text-green-700 border-green-200',
        progressClass: 'bg-green-500',
        iconClass: 'text-green-500',
        borderClass: 'border-green-200',
      };
    case 'medium':
      return {
        badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
        progressClass: 'bg-orange-500',
        iconClass: 'text-orange-500',
        borderClass: 'border-orange-200',
      };
    case 'high':
    default:
      return {
        badgeClass: 'bg-red-100 text-red-700 border-red-200',
        progressClass: 'bg-red-500',
        iconClass: 'text-red-500',
        borderClass: 'border-red-200',
      };
  }
}

/**
 * Calculate order total including delivery fee
 */
export function calculateOrderTotal(subtotal: number): {
  subtotal: number;
  deliveryFee: number;
  total: number;
  feeInfo: DeliveryFeeInfo;
} {
  const feeInfo = calculateDeliveryFee(subtotal);
  return {
    subtotal,
    deliveryFee: feeInfo.fee,
    total: subtotal + feeInfo.fee,
    feeInfo,
  };
}
