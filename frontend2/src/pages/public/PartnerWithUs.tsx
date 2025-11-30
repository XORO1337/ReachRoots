import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Truck, 
  Clock, 
  DollarSign, 
  Shield, 
  Fuel, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Upload,
  User,
  Car,
  FileText,
  CreditCard,
  MapPin,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Types
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
}

interface VehicleDetails {
  vehicleType: string;
  vehicleRegistrationNumber: string;
  insuranceValidUntil: string;
}

interface DocumentUploads {
  driverLicenseFront: File | null;
  driverLicenseBack: File | null;
  vehicleRegistrationCertificate: File | null;
  vehicleInsurance: File | null;
  addressProof: File | null;
  addressProofType: string;
  profilePhoto: File | null;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId: string;
}

interface Availability {
  preferredAreas: { city: string; district: string; pinCodes: string[] }[];
  availableDays: string[];
  availableTimeSlots: string[];
}

// Benefits data
const benefits = [
  { icon: Clock, title: 'Flexible Hours', description: 'Work on your own schedule - mornings, evenings, or weekends' },
  { icon: DollarSign, title: 'Competitive Earnings', description: 'Earn ₹30 base + 2% commission per delivery' },
  { icon: CreditCard, title: 'Weekly Payouts', description: 'Get your earnings deposited every week' },
  { icon: Shield, title: 'Insurance Coverage', description: 'Stay protected with our comprehensive insurance' },
  { icon: Fuel, title: 'Fuel Support', description: 'Fuel reimbursement for long-distance deliveries' },
];

// Requirements data
const requirements = [
  'Valid driver\'s license (2-wheeler or 4-wheeler)',
  'Own vehicle (bike, scooter, car, or van)',
  'Smartphone with GPS capability',
  'Minimum age of 18 years',
  'Clear background verification',
  'Valid vehicle insurance',
];

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Vehicle Details', icon: Car },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Bank Details', icon: CreditCard },
  { id: 5, title: 'Availability', icon: MapPin },
];

const vehicleTypes = [
  { value: 'bike', label: 'Motorcycle/Bike' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
];

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const timeSlots = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
  { value: 'evening', label: 'Evening (6 PM - 10 PM)' },
  { value: 'night', label: 'Night (10 PM - 6 AM)' },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
];

const PartnerWithUs: React.FC = () => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ applicationId: string; status: string } | null>(null);
  
  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    street: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
  });
  
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails>({
    vehicleType: '',
    vehicleRegistrationNumber: '',
    insuranceValidUntil: '',
  });
  
  const [documents, setDocuments] = useState<DocumentUploads>({
    driverLicenseFront: null,
    driverLicenseBack: null,
    vehicleRegistrationCertificate: null,
    vehicleInsurance: null,
    addressProof: null,
    addressProofType: '',
    profilePhoto: null,
  });
  
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });
  
  const [availability, setAvailability] = useState<Availability>({
    preferredAreas: [{ city: '', district: '', pinCodes: [] }],
    availableDays: [],
    availableTimeSlots: [],
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!personalInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!personalInfo.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) newErrors.email = 'Invalid email format';
        if (!personalInfo.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^[6-9]\d{9}$/.test(personalInfo.phone)) newErrors.phone = 'Invalid phone number';
        if (!personalInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        else {
          const age = calculateAge(personalInfo.dateOfBirth);
          if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old';
        }
        if (!personalInfo.city.trim()) newErrors.city = 'City is required';
        if (!personalInfo.district.trim()) newErrors.district = 'District is required';
        if (!personalInfo.state) newErrors.state = 'State is required';
        if (!personalInfo.pinCode.trim()) newErrors.pinCode = 'PIN code is required';
        else if (!/^\d{6}$/.test(personalInfo.pinCode)) newErrors.pinCode = 'Invalid PIN code';
        break;
        
      case 2:
        if (!vehicleDetails.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
        if (!vehicleDetails.vehicleRegistrationNumber.trim()) newErrors.vehicleRegistrationNumber = 'Registration number is required';
        if (!vehicleDetails.insuranceValidUntil) newErrors.insuranceValidUntil = 'Insurance validity date is required';
        else if (new Date(vehicleDetails.insuranceValidUntil) <= new Date()) newErrors.insuranceValidUntil = 'Insurance must be valid (not expired)';
        break;
        
      case 3:
        if (!documents.driverLicenseFront) newErrors.driverLicenseFront = 'Driver license front is required';
        if (!documents.driverLicenseBack) newErrors.driverLicenseBack = 'Driver license back is required';
        if (!documents.vehicleRegistrationCertificate) newErrors.vehicleRegistrationCertificate = 'RC is required';
        if (!documents.vehicleInsurance) newErrors.vehicleInsurance = 'Vehicle insurance is required';
        if (!documents.addressProof) newErrors.addressProof = 'Address proof is required';
        if (!documents.addressProofType) newErrors.addressProofType = 'Select address proof type';
        if (!documents.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
        break;
        
      case 4:
        if (!bankDetails.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
        if (!bankDetails.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
        if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) newErrors.confirmAccountNumber = 'Account numbers do not match';
        if (!bankDetails.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode.toUpperCase())) newErrors.ifscCode = 'Invalid IFSC code format';
        break;
        
      case 5:
        if (availability.preferredAreas.length === 0 || !availability.preferredAreas[0].city) {
          newErrors.preferredAreas = 'At least one service area is required';
        }
        if (availability.availableDays.length === 0) newErrors.availableDays = 'Select at least one day';
        if (availability.availableTimeSlots.length === 0) newErrors.availableTimeSlots = 'Select at least one time slot';
        if (!termsAccepted) newErrors.terms = 'You must accept the terms and conditions';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadFile = async (file: File): Promise<{ url: string; publicId: string }> => {
    // For now, return a placeholder. In production, upload to ImageKit
    // TODO: Implement actual file upload to ImageKit
    const formData = new FormData();
    formData.append('file', file);
    
    // Placeholder - in production, call the actual upload endpoint
    return {
      url: URL.createObjectURL(file),
      publicId: `temp_${Date.now()}_${file.name}`
    };
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload all documents first
      const uploadedDocs: Record<string, { url: string; publicId: string }> = {};
      
      // In production, upload files to ImageKit here
      // For now, we'll use placeholder URLs
      if (documents.profilePhoto) {
        uploadedDocs.profilePhoto = await uploadFile(documents.profilePhoto);
      }
      if (documents.driverLicenseFront) {
        uploadedDocs.driverLicenseFront = await uploadFile(documents.driverLicenseFront);
      }
      if (documents.driverLicenseBack) {
        uploadedDocs.driverLicenseBack = await uploadFile(documents.driverLicenseBack);
      }
      if (documents.vehicleRegistrationCertificate) {
        uploadedDocs.vehicleRC = await uploadFile(documents.vehicleRegistrationCertificate);
      }
      if (documents.vehicleInsurance) {
        uploadedDocs.vehicleInsurance = await uploadFile(documents.vehicleInsurance);
      }
      if (documents.addressProof) {
        uploadedDocs.addressProof = await uploadFile(documents.addressProof);
      }
      
      // Prepare application data
      const applicationData = {
        personalInfo: {
          fullName: personalInfo.fullName,
          email: personalInfo.email.toLowerCase(),
          phone: personalInfo.phone,
          dateOfBirth: personalInfo.dateOfBirth,
          address: {
            street: personalInfo.street,
            city: personalInfo.city,
            district: personalInfo.district,
            state: personalInfo.state,
            pinCode: personalInfo.pinCode,
          },
          profilePhoto: uploadedDocs.profilePhoto,
        },
        vehicleDetails: {
          vehicleType: vehicleDetails.vehicleType,
          vehicleRegistrationNumber: vehicleDetails.vehicleRegistrationNumber.toUpperCase(),
          insuranceValidUntil: vehicleDetails.insuranceValidUntil,
        },
        documents: {
          driverLicenseFront: uploadedDocs.driverLicenseFront,
          driverLicenseBack: uploadedDocs.driverLicenseBack,
          vehicleRegistrationCertificate: uploadedDocs.vehicleRC,
          vehicleInsurance: uploadedDocs.vehicleInsurance,
          addressProof: {
            ...uploadedDocs.addressProof,
            type: documents.addressProofType,
          },
        },
        bankDetails: {
          accountHolderName: bankDetails.accountHolderName,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode.toUpperCase(),
          bankName: bankDetails.bankName,
          upiId: bankDetails.upiId || undefined,
        },
        availability: {
          preferredAreas: availability.preferredAreas.filter(a => a.city),
          availableDays: availability.availableDays,
          availableTimeSlots: availability.availableTimeSlots,
        },
        termsAccepted: true,
      };
      
      const response = await fetch('/api/agent-applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmissionResult({
          applicationId: result.data.applicationId,
          status: result.data.status,
        });
        toast.success('Application submitted successfully!');
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (field: keyof DocumentUploads) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Only images and PDFs are allowed');
        return;
      }
      setDocuments(prev => ({ ...prev, [field]: file }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const toggleTimeSlot = (slot: string) => {
    setAvailability(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.includes(slot)
        ? prev.availableTimeSlots.filter(s => s !== slot)
        : [...prev.availableTimeSlots, slot]
    }));
  };

  const addServiceArea = () => {
    setAvailability(prev => ({
      ...prev,
      preferredAreas: [...prev.preferredAreas, { city: '', district: '', pinCodes: [] }]
    }));
  };

  const removeServiceArea = (index: number) => {
    setAvailability(prev => ({
      ...prev,
      preferredAreas: prev.preferredAreas.filter((_, i) => i !== index)
    }));
  };

  const updateServiceArea = (index: number, field: string, value: string) => {
    setAvailability(prev => ({
      ...prev,
      preferredAreas: prev.preferredAreas.map((area, i) => 
        i === index ? { ...area, [field]: value } : area
      )
    }));
  };

  // Success screen after submission
  if (submissionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your application is now under review. We'll notify you via email within 48-72 hours.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Application ID</p>
            <p className="text-xl font-mono font-bold text-green-600">{submissionResult.applicationId}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Save this ID to check your application status.
          </p>
          <div className="space-y-3">
            <Link
              to={`/partner-with-us/status?id=${submissionResult.applicationId}`}
              className="block w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Check Application Status
            </Link>
            <Link
              to="/"
              className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-green-600 text-white py-6">
          <div className="max-w-4xl mx-auto px-4">
            <button 
              onClick={() => setShowForm(false)}
              className="flex items-center text-green-100 hover:text-white mb-4"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Info
            </button>
            <h1 className="text-2xl font-bold">Delivery Partner Registration</h1>
            <p className="text-green-100">Complete the form below to apply</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium
                      ${currentStep > step.id ? 'bg-green-600 text-white' : 
                        currentStep === step.id ? 'bg-green-600 text-white' : 
                        'bg-gray-200 text-gray-500'}
                    `}>
                      {currentStep > step.id ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`ml-2 text-sm hidden sm:block ${
                      currentStep >= step.id ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-16 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="10-digit mobile number"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={personalInfo.dateOfBirth}
                    onChange={(e) => setPersonalInfo({...personalInfo, dateOfBirth: e.target.value})}
                    max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={personalInfo.street}
                    onChange={(e) => setPersonalInfo({...personalInfo, street: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="House no., Street name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={personalInfo.city}
                      onChange={(e) => setPersonalInfo({...personalInfo, city: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter city"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                    <input
                      type="text"
                      value={personalInfo.district}
                      onChange={(e) => setPersonalInfo({...personalInfo, district: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter district"
                    />
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <select
                      value={personalInfo.state}
                      onChange={(e) => setPersonalInfo({...personalInfo, state: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      value={personalInfo.pinCode}
                      onChange={(e) => setPersonalInfo({...personalInfo, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.pinCode ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="6-digit PIN code"
                    />
                    {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                  <select
                    value={vehicleDetails.vehicleType}
                    onChange={(e) => setVehicleDetails({...vehicleDetails, vehicleType: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration Number *</label>
                  <input
                    type="text"
                    value={vehicleDetails.vehicleRegistrationNumber}
                    onChange={(e) => setVehicleDetails({...vehicleDetails, vehicleRegistrationNumber: e.target.value.toUpperCase()})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.vehicleRegistrationNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., MH12AB1234"
                  />
                  {errors.vehicleRegistrationNumber && <p className="text-red-500 text-sm mt-1">{errors.vehicleRegistrationNumber}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Valid Until *</label>
                  <input
                    type="date"
                    value={vehicleDetails.insuranceValidUntil}
                    onChange={(e) => setVehicleDetails({...vehicleDetails, insuranceValidUntil: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.insuranceValidUntil ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.insuranceValidUntil && <p className="text-red-500 text-sm mt-1">{errors.insuranceValidUntil}</p>}
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      Your vehicle insurance must be valid. Expired insurance will result in application rejection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Uploads */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Uploads</h2>
                <p className="text-sm text-gray-600 mb-4">Upload clear images or PDFs (max 5MB each)</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo *</label>
                  <FileUpload
                    file={documents.profilePhoto}
                    onChange={handleFileChange('profilePhoto')}
                    error={errors.profilePhoto}
                    accept="image/*"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver's License (Front) *</label>
                    <FileUpload
                      file={documents.driverLicenseFront}
                      onChange={handleFileChange('driverLicenseFront')}
                      error={errors.driverLicenseFront}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver's License (Back) *</label>
                    <FileUpload
                      file={documents.driverLicenseBack}
                      onChange={handleFileChange('driverLicenseBack')}
                      error={errors.driverLicenseBack}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle RC *</label>
                    <FileUpload
                      file={documents.vehicleRegistrationCertificate}
                      onChange={handleFileChange('vehicleRegistrationCertificate')}
                      error={errors.vehicleRegistrationCertificate}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Insurance *</label>
                    <FileUpload
                      file={documents.vehicleInsurance}
                      onChange={handleFileChange('vehicleInsurance')}
                      error={errors.vehicleInsurance}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Proof Type *</label>
                  <select
                    value={documents.addressProofType}
                    onChange={(e) => setDocuments({...documents, addressProofType: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.addressProofType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Type</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="utility_bill">Utility Bill</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                  {errors.addressProofType && <p className="text-red-500 text-sm mt-1">{errors.addressProofType}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Proof Document *</label>
                  <FileUpload
                    file={documents.addressProof}
                    onChange={handleFileChange('addressProof')}
                    error={errors.addressProof}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Bank Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Account Details</h2>
                <p className="text-sm text-gray-600 mb-4">For receiving your earnings</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.accountHolderName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Name as per bank records"
                  />
                  {errors.accountHolderName && <p className="text-red-500 text-sm mt-1">{errors.accountHolderName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value.replace(/\D/g, '')})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter account number"
                  />
                  {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Account Number *</label>
                  <input
                    type="text"
                    value={bankDetails.confirmAccountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, confirmAccountNumber: e.target.value.replace(/\D/g, '')})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.confirmAccountNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Re-enter account number"
                  />
                  {errors.confirmAccountNumber && <p className="text-red-500 text-sm mt-1">{errors.confirmAccountNumber}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.ifscCode ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g., HDFC0001234"
                    />
                    {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., HDFC Bank"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={bankDetails.upiId}
                    onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="yourname@upi"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Availability */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability & Service Areas</h2>
                
                {/* Service Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Service Areas *</label>
                  {availability.preferredAreas.map((area, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={area.city}
                        onChange={(e) => updateServiceArea(index, 'city', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={area.district}
                        onChange={(e) => updateServiceArea(index, 'district', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="District"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeServiceArea(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addServiceArea}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    + Add another area
                  </button>
                  {errors.preferredAreas && <p className="text-red-500 text-sm mt-1">{errors.preferredAreas}</p>}
                </div>
                
                {/* Available Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Days *</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                          availability.availableDays.includes(day)
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  {errors.availableDays && <p className="text-red-500 text-sm mt-1">{errors.availableDays}</p>}
                </div>
                
                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time Slots *</label>
                  <div className="space-y-2">
                    {timeSlots.map(slot => (
                      <label key={slot.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={availability.availableTimeSlots.includes(slot.value)}
                          onChange={() => toggleTimeSlot(slot.value)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-gray-700">{slot.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.availableTimeSlots && <p className="text-red-500 text-sm mt-1">{errors.availableTimeSlots}</p>}
                </div>
                
                {/* Terms */}
                <div className="border-t pt-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      I agree to the <a href="/terms" className="text-green-600 hover:underline">Terms of Service</a> and{' '}
                      <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>. I confirm that all 
                      information provided is accurate and I meet all requirements to become a delivery partner.
                    </span>
                  </label>
                  {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <button
                  onClick={handlePrev}
                  className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>
              ) : (
                <div />
              )}
              
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Become a Delivery Partner
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Earn on your schedule. Join our growing network of delivery partners 
                and start earning today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Apply Now
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
                <Link
                  to="/agent/login"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors text-center"
                >
                  Agent Login
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                <Truck className="w-32 h-32 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Partner With Us?
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Earnings Calculator */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Earn More With Every Delivery</h2>
          <p className="text-gray-600 mb-8">Our transparent commission structure ensures you always know what you'll earn</p>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4">
                <p className="text-4xl font-bold text-green-600">₹30</p>
                <p className="text-gray-600">Base fee per delivery</p>
              </div>
              <div className="p-4 border-l border-r border-gray-200">
                <p className="text-4xl font-bold text-green-600">+2%</p>
                <p className="text-gray-600">Of order value</p>
              </div>
              <div className="p-4">
                <p className="text-4xl font-bold text-green-600">₹50+</p>
                <p className="text-gray-600">Average per delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Requirements to Join
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-green-100 mb-8">Join thousands of delivery partners already earning with us</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-10 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} RootsReach. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// File Upload Component
interface FileUploadProps {
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, onChange, error, accept = "image/*,application/pdf" }) => {
  return (
    <div>
      <label className={`
        flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
        ${error ? 'border-red-500 bg-red-50' : file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'}
      `}>
        {file ? (
          <div className="flex flex-col items-center text-green-600">
            <CheckCircle className="w-8 h-8 mb-2" />
            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">Click to upload</span>
          </div>
        )}
        <input type="file" className="hidden" onChange={onChange} accept={accept} />
      </label>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PartnerWithUs;
