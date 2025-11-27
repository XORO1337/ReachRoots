import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Gift, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { 
  calculateDeliveryFee, 
  getDeliveryTierStyles, 
  DELIVERY_THRESHOLDS,
  DELIVERY_FEES,
  DeliveryFeeInfo 
} from '../../utils/deliveryFee';

interface DeliveryFeeTrackerProps {
  subtotal: number;
  onBrowseProducts?: () => void;
  compact?: boolean;
}

const DeliveryFeeTracker: React.FC<DeliveryFeeTrackerProps> = ({ 
  subtotal, 
  onBrowseProducts,
  compact = false 
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevTier, setPrevTier] = useState<DeliveryFeeInfo['tier'] | null>(null);
  
  const feeInfo = calculateDeliveryFee(subtotal);
  const styles = getDeliveryTierStyles(feeInfo.tier);

  // Detect tier change for confetti animation
  useEffect(() => {
    if (prevTier && prevTier !== feeInfo.tier && feeInfo.tier === 'free') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setPrevTier(feeInfo.tier);
  }, [feeInfo.tier, prevTier]);

  if (compact) {
    return (
      <div className={`rounded-lg p-3 border ${styles.borderClass} ${styles.badgeClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className={`h-4 w-4 ${styles.iconClass}`} />
            <span className="text-sm font-medium">
              {feeInfo.tier === 'free' ? t('delivery.freeDelivery') + '!' : t('delivery.title') + `: ₹${feeInfo.fee}`}
            </span>
          </div>
          {feeInfo.tier !== 'free' && (
            <span className="text-xs">
              ₹{Math.ceil(feeInfo.amountToNextTier)} {t('delivery.addMore')} {feeInfo.tier === 'high' ? t('delivery.toSave10') : t('delivery.free')}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 ${styles.borderClass} overflow-hidden transition-all duration-300 relative`}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="animate-bounce">
            <Sparkles className="h-6 w-6 text-yellow-400 absolute top-2 left-1/4" />
            <Sparkles className="h-4 w-4 text-green-400 absolute top-4 right-1/3" />
            <Sparkles className="h-5 w-5 text-orange-400 absolute top-1 right-1/4" />
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className={`p-4 ${feeInfo.tier === 'free' ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {feeInfo.tier === 'free' ? (
              <Gift className="h-5 w-5 text-green-500" />
            ) : (
              <Truck className={`h-5 w-5 ${styles.iconClass}`} />
            )}
            <span className={`font-semibold ${feeInfo.tierColor}`}>
              {feeInfo.tier === 'free' ? t('delivery.freeDeliveryUnlocked') : `${t('delivery.deliveryFee')}: ₹${feeInfo.fee}`}
            </span>
          </div>
          {feeInfo.tier === 'free' && (
            <span className="text-sm text-green-600 font-medium">
              {t('delivery.savingOnDelivery')}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {feeInfo.tier !== 'free' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>₹0</span>
              <span>₹{DELIVERY_THRESHOLDS.REDUCED_FEE}</span>
              <span>₹{DELIVERY_THRESHOLDS.FREE_DELIVERY}</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${styles.progressClass} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${Math.min((subtotal / DELIVERY_THRESHOLDS.FREE_DELIVERY) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className={feeInfo.tier === 'high' ? 'text-red-500 font-medium' : 'text-gray-400'}>
                ₹39 {t('delivery.fee')}
              </span>
              <span className={feeInfo.tier === 'medium' ? 'text-orange-500 font-medium' : 'text-gray-400'}>
                ₹29 {t('delivery.fee')}
              </span>
              <span className="text-green-500 font-medium">{t('delivery.free')}</span>
            </div>
          </div>
        )}

        {/* Smart Tip Message */}
        {feeInfo.tipMessage && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-700">{feeInfo.tipMessage}</p>
          </div>
        )}

        {/* Expandable Details */}
        {feeInfo.tier !== 'free' && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center justify-center w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <span>{t('delivery.hideDetails')}</span>
                <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                <span>{t('delivery.viewAllTiers')}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Expanded Tier Details */}
      {isExpanded && feeInfo.tier !== 'free' && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('delivery.deliveryFeeTiers')}</h4>
          <div className="space-y-2">
            <div className={`flex items-center justify-between p-2 rounded ${feeInfo.tier === 'high' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
              <span className="text-sm">{t('delivery.cartBelow')} ₹{DELIVERY_THRESHOLDS.REDUCED_FEE}</span>
              <span className={`text-sm font-semibold ${feeInfo.tier === 'high' ? 'text-red-600' : 'text-gray-500'}`}>₹{DELIVERY_FEES.HIGH}</span>
            </div>
            <div className={`flex items-center justify-between p-2 rounded ${feeInfo.tier === 'medium' ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
              <span className="text-sm">{t('delivery.cart')} ₹{DELIVERY_THRESHOLDS.REDUCED_FEE} - ₹{DELIVERY_THRESHOLDS.FREE_DELIVERY - 1}</span>
              <span className={`text-sm font-semibold ${feeInfo.tier === 'medium' ? 'text-orange-600' : 'text-gray-500'}`}>₹{DELIVERY_FEES.MEDIUM}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-green-50 border border-green-200">
              <span className="text-sm">{t('delivery.cart')} ₹{DELIVERY_THRESHOLDS.FREE_DELIVERY}+</span>
              <span className="text-sm font-semibold text-green-600">{t('delivery.free')}</span>
            </div>
          </div>

          {onBrowseProducts && (
            <button
              onClick={onBrowseProducts}
              className="mt-4 w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {t('delivery.browseProducts')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryFeeTracker;
