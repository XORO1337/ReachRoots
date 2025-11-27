import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight,
  RotateCcw,
  MessageSquare,
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react';
import OrderStatusService, { 
  STATUS_INFO, 
  STATUS_FLOW, 
  StatusHistoryEntry,
  ShippingCarrier,
  SelfShipData
} from '../../services/orderStatusService';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  status: string;
  orderNumber?: string;
  shippingMethod?: string;
  shippingDetails?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  statusHistory?: StatusHistoryEntry[];
  lastStatusChangeAt?: string;
}

interface OrderStatusManagerProps {
  order: Order;
  onStatusUpdate?: () => void;
  isArtisan?: boolean;
}

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  order,
  onStatusUpdate,
  isArtisan = true
}) => {
  const orderId = order._id;
  const orderNumber = order.orderNumber || order._id.slice(-8).toUpperCase();
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [canModify, setCanModify] = useState(false);
  const [modificationTimeRemaining, setModificationTimeRemaining] = useState(0);
  const [_allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  
  // Form states
  const [note, setNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [shippingData, setShippingData] = useState<SelfShipData>({
    carrier: '',
    trackingNumber: '',
    estimatedDelivery: ''
  });

  // Load status history and carriers on mount
  useEffect(() => {
    if (orderId) {
      loadStatusHistory();
      loadCarriers();
    }
  }, [orderId]);

  // Sync status when order prop changes
  useEffect(() => {
    setCurrentStatus(order.status);
  }, [order.status]);

  // Countdown timer for modification window
  useEffect(() => {
    if (modificationTimeRemaining > 0) {
      const timer = setInterval(() => {
        setModificationTimeRemaining(prev => {
          if (prev <= 1) {
            setCanModify(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [modificationTimeRemaining]);

  const loadStatusHistory = async () => {
    if (!orderId) return;
    try {
      const data = await OrderStatusService.getStatusHistory(orderId);
      setStatusHistory(data.history);
      setCurrentStatus(data.currentStatus);
      setCanModify(data.canModify);
      setModificationTimeRemaining(data.modificationWindowRemaining);
      setAllowedTransitions(data.allowedTransitions);
    } catch (error) {
      console.error('Failed to load status history:', error);
    }
  };

  const loadCarriers = async () => {
    const carrierList = await OrderStatusService.getShippingCarriers();
    setCarriers(carrierList);
  };

  const handleStatusAction = async (action: string) => {
    setIsLoading(true);
    try {
      let result;
      switch (action) {
        case 'receive':
          result = await OrderStatusService.markAsReceived(orderId, note || undefined);
          toast.success('Order marked as received');
          break;
        case 'pack':
          result = await OrderStatusService.markAsPacked(orderId, note || undefined);
          toast.success('Order marked as packed');
          break;
        case 'request_pickup':
          result = await OrderStatusService.requestPickupAgent(orderId, { note: note || undefined });
          toast.success('Pickup agent requested successfully');
          break;
        case 'deliver':
          result = await OrderStatusService.markAsDelivered(orderId, { note: note || undefined });
          toast.success('Order marked as delivered');
          break;
        default:
          throw new Error('Unknown action');
      }
      
      setCurrentStatus(result.newStatus || result.order?.status);
      setNote('');
      onStatusUpdate?.();
      await loadStatusHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfShip = async () => {
    if (!shippingData.carrier || !shippingData.trackingNumber) {
      toast.error('Please fill in carrier and tracking number');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await OrderStatusService.confirmSelfShipping(orderId, shippingData);
      toast.success(`Order shipped via ${result.carrier}. Tracking: ${result.trackingNumber}`);
      setCurrentStatus('shipped');
      setShowShippingForm(false);
      setShippingData({ carrier: '', trackingNumber: '', estimatedDelivery: '' });
      onStatusUpdate?.();
      await loadStatusHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm shipping');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    
    setIsLoading(true);
    try {
      await OrderStatusService.cancelOrder(orderId, cancelReason);
      toast.success('Order cancelled');
      setCurrentStatus('cancelled');
      setShowCancelForm(false);
      setCancelReason('');
      onStatusUpdate?.();
      await loadStatusHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error('Please enter a note');
      return;
    }
    
    setIsLoading(true);
    try {
      await OrderStatusService.addNote(orderId, note);
      toast.success('Note added');
      setNote('');
      setShowNoteForm(false);
      await loadStatusHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async () => {
    if (!canModify) {
      toast.error('Modification window has expired');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await OrderStatusService.revertStatus(orderId, 'Status correction');
      toast.success(`Status reverted to ${result.revertedTo}`);
      setCurrentStatus(result.revertedTo);
      onStatusUpdate?.();
      await loadStatusHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to revert status');
    } finally {
      setIsLoading(false);
    }
  };

  const statusInfo = STATUS_INFO[currentStatus] || STATUS_INFO['pending'];
  const isTerminal = OrderStatusService.isTerminalStatus(currentStatus);

  // Render status progress indicator
  const renderProgressIndicator = () => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const isCancelled = currentStatus === 'cancelled';
    
    return (
      <div className="flex items-center justify-between mb-6 px-4">
        {STATUS_FLOW.map((status, index) => {
          const info = STATUS_INFO[status];
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex && !isCancelled;
          const isPending = index > currentIndex;
          
          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isActive && !isCancelled ? `${info.bgColor} ${info.color}` : ''}
                  ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                  ${isCancelled && isActive ? 'bg-red-500 text-white' : ''}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs mt-1 text-center max-w-[80px] ${isActive ? 'font-medium' : 'text-gray-500'}`}>
                  {info.label}
                </span>
              </div>
              {index < STATUS_FLOW.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Render action buttons based on current status
  const renderActions = () => {
    if (!isArtisan || isTerminal) return null;

    return (
      <div className="space-y-4">
        {/* Status-specific actions */}
        {currentStatus === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusAction('receive')}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
              Mark as Received
            </button>
          </div>
        )}

        {currentStatus === 'received' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusAction('pack')}
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
              Mark as Packed
            </button>
            <button
              onClick={() => setShowCancelForm(true)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Not Yet Packed
            </button>
          </div>
        )}

        {currentStatus === 'packed' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 font-medium">Choose shipping method:</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusAction('request_pickup')}
                disabled={isLoading}
                className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                Request Pickup Agent
              </button>
              <button
                onClick={() => setShowShippingForm(true)}
                disabled={isLoading}
                className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Truck className="w-5 h-5" />
                Self-Ship with Tracking
              </button>
            </div>
          </div>
        )}

        {currentStatus === 'pickup_requested' && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 text-purple-700">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Waiting for pickup agent...</span>
            </div>
            <p className="text-sm text-purple-600 mt-1">You will receive confirmation with agent details shortly.</p>
            <button
              onClick={() => setShowShippingForm(true)}
              className="mt-3 text-sm text-purple-700 underline"
            >
              Or self-ship instead
            </button>
          </div>
        )}

        {currentStatus === 'shipped' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusAction('deliver')}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Mark as Delivered
            </button>
          </div>
        )}

        {/* Common actions */}
        <div className="flex gap-2 pt-2 border-t">
          <button
            onClick={() => setShowNoteForm(true)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <MessageSquare className="w-4 h-4" />
            Add Note
          </button>
          
          {canModify && modificationTimeRemaining > 0 && (
            <button
              onClick={handleRevert}
              disabled={isLoading}
              className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 ml-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Undo ({OrderStatusService.formatTimeRemaining(modificationTimeRemaining)})
            </button>
          )}
          
          {!isTerminal && currentStatus !== 'shipped' && (
            <button
              onClick={() => setShowCancelForm(true)}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 ml-auto"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render shipping form modal
  const renderShippingForm = () => {
    if (!showShippingForm) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">Confirm Self-Shipping</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Carrier *</label>
              <select
                value={shippingData.carrier}
                onChange={(e) => setShippingData({ ...shippingData, carrier: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select carrier...</option>
                {carriers.map(carrier => (
                  <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number *</label>
              <input
                type="text"
                value={shippingData.trackingNumber}
                onChange={(e) => setShippingData({ ...shippingData, trackingNumber: e.target.value })}
                placeholder="Enter tracking number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={shippingData.estimatedDelivery}
                onChange={(e) => setShippingData({ ...shippingData, estimatedDelivery: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowShippingForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSelfShip}
              disabled={isLoading || !shippingData.carrier || !shippingData.trackingNumber}
              className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
              Confirm Shipping
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render cancel form modal
  const renderCancelForm = () => {
    if (!showCancelForm) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Cancel Order
          </h3>
          
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel order #{orderNumber}? This action cannot be undone.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for cancellation *</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowCancelForm(false);
                setCancelReason('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading || !cancelReason.trim()}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render note form modal
  const renderNoteForm = () => {
    if (!showNoteForm) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">Add Note</h3>
          
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter your note..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowNoteForm(false);
                setNote('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={isLoading || !note.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Note'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render status history timeline
  const renderHistory = () => {
    if (!showHistory) return null;

    return (
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
        <div className="space-y-3">
          {statusHistory.map((entry, index) => {
            const info = STATUS_INFO[entry.status] || STATUS_INFO['pending'];
            return (
              <div key={entry._id || index} className="flex gap-3">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${info.bgColor}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${info.color}`}>
                      {entry.statusDisplayName || info.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-gray-600 mt-0.5">{entry.note}</p>
                  )}
                  {entry.updatedBy && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      by {entry.updatedBy.name || entry.updatedByRole}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Order Status</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Progress Indicator */}
      {!isTerminal && renderProgressIndicator()}

      {/* Status Description */}
      <p className="text-gray-600 text-sm mb-4">{statusInfo.description}</p>

      {/* Action Buttons */}
      {renderActions()}

      {/* Toggle History */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mt-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
        {showHistory ? 'Hide' : 'View'} Order Timeline
      </button>

      {/* History Timeline */}
      {renderHistory()}

      {/* Modals */}
      {renderShippingForm()}
      {renderCancelForm()}
      {renderNoteForm()}
    </div>
  );
};

export default OrderStatusManager;
