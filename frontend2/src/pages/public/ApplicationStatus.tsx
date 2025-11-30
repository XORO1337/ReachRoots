import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileQuestion,
  Loader2,
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react';

interface ApplicationStatus {
  applicationId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_required';
  applicantName: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-500',
    title: 'Application Pending',
    description: 'Your application is in queue and will be reviewed soon.',
  },
  under_review: {
    icon: Search,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500',
    title: 'Under Review',
    description: 'Our team is currently reviewing your application and documents.',
  },
  approved: {
    icon: CheckCircle,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-500',
    title: 'Application Approved!',
    description: 'Congratulations! Your login credentials have been sent to your email.',
  },
  rejected: {
    icon: XCircle,
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-500',
    title: 'Application Rejected',
    description: 'Unfortunately, your application could not be approved at this time.',
  },
  more_info_required: {
    icon: FileQuestion,
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-500',
    title: 'Additional Information Required',
    description: 'Please provide the requested information to proceed with your application.',
  },
};

const ApplicationStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState(searchParams.get('id') || '');
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setIdentifier(id);
      checkStatus(id);
    }
  }, [searchParams]);

  const checkStatus = async (id?: string) => {
    const searchId = id || identifier.trim();
    
    if (!searchId) {
      setError(t('applicationStatus.enterIdentifier'));
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus(null);

    try {
      const response = await fetch(`/api/agent-applications/status/${encodeURIComponent(searchId)}`);
      const result = await response.json();

      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.message || t('applicationStatus.notFound'));
      }
    } catch (err) {
      setError(t('applicationStatus.checkFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkStatus();
  };

  const config = status ? statusConfig[status.status] : null;
  const StatusIcon = config?.icon || Clock;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link 
            to="/partner-with-us" 
            className="inline-flex items-center text-green-100 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            {t('applicationStatus.backToPartner')}
          </Link>
          <h1 className="text-3xl font-bold">{t('applicationStatus.title')}</h1>
          <p className="text-green-100">{t('applicationStatus.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('applicationStatus.searchPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  {t('applicationStatus.check')}
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Status Result */}
        {status && config && (
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-l-4 ${config.borderColor}`}>
            {/* Status Header */}
            <div className={`${config.bgColor} p-6`}>
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mr-4`}>
                  <StatusIcon className={`w-6 h-6 ${config.textColor}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${config.textColor}`}>{config.title}</h2>
                  <p className="text-gray-600">{config.description}</p>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">{t('applicationStatus.applicationId')}</p>
                  <p className="font-mono font-semibold text-gray-900">{status.applicationId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('applicationStatus.applicantName')}</p>
                  <p className="font-semibold text-gray-900">{status.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('applicationStatus.submittedOn')}</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(status.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {status.reviewedAt && (
                  <div>
                    <p className="text-sm text-gray-500">{t('applicationStatus.reviewedOn')}</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(status.reviewedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {status.status === 'rejected' && status.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-red-800 mb-2">{t('applicationStatus.rejectionReason')}</h3>
                  <p className="text-red-700">{status.rejectionReason}</p>
                </div>
              )}

              {/* Additional Info Required */}
              {status.status === 'more_info_required' && status.additionalInfoRequested && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-orange-800 mb-2">{t('applicationStatus.infoRequested')}</h3>
                  <p className="text-orange-700">{status.additionalInfoRequested}</p>
                </div>
              )}

              {/* Next Steps */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-3">{t('applicationStatus.nextSteps')}</h3>
                {status.status === 'pending' && (
                  <p className="text-gray-600">
                    {t('applicationStatus.pendingNextSteps')}
                  </p>
                )}
                {status.status === 'under_review' && (
                  <p className="text-gray-600">
                    {t('applicationStatus.reviewNextSteps')}
                  </p>
                )}
                {status.status === 'approved' && (
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      {t('applicationStatus.approvedNextSteps')}
                    </p>
                    <Link
                      to="/agent/login"
                      className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {t('applicationStatus.goToAgentLogin')}
                    </Link>
                  </div>
                )}
                {status.status === 'rejected' && (
                  <p className="text-gray-600">
                    {t('applicationStatus.rejectedNextSteps')}
                  </p>
                )}
                {status.status === 'more_info_required' && (
                  <p className="text-gray-600">
                    {t('applicationStatus.moreInfoNextSteps')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('applicationStatus.needHelp')}</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3 text-green-600" />
              <span>partners@rootsreach.com</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3 text-green-600" />
              <span>{t('applicationStatus.supportPhone')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatusPage;
