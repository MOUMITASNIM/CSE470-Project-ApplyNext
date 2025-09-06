import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { X, CreditCard, Lock, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Initialize Stripe with publishable key from server
let stripePromise = null;

const getStripe = async () => {
  if (!stripePromise) {
    try {
      const response = await axios.get('/api/payments/config');
      stripePromise = loadStripe(response.data.publishableKey);
    } catch (error) {
      console.error('Failed to get Stripe config:', error);
      return null;
    }
  }
  return stripePromise;
};

const CheckoutForm = ({ 
  formData,
  itemId,
  type, 
  amount, 
  currency, 
  itemName, 
  onSuccess, 
  onError,
  onClose 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post('/api/payments/create-intent', {
          itemId,
          type,
          amount,
          currency
        });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast.error(error.response?.data?.message || 'Failed to initialize payment');
        onError?.(error);
      }
    };

    if (itemId && type) {
      createPaymentIntent();
    }
  }, [itemId, type, amount, currency, onError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    const cardNumber = elements.getElement(CardNumberElement);

    if (!cardholderName.trim()) {
      toast.error('Please enter cardholder name');
      setLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: cardholderName,
          },
        }
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        // Report payment success to backend
        await axios.post('/api/payments/success', {
          paymentIntentId: paymentIntent.id,
          formData: formData
        });
        
        toast.success('Payment successful! Your application has been submitted.');
        onSuccess?.(paymentIntent);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Payment processing failed');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Item:</span>
            <span className="font-medium">{itemName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Application Fee:</span>
            <span className="font-semibold text-lg">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency || 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(amount || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Enter cardholder name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="inline h-4 w-4 mr-1" />
            Card Number
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardNumberElement options={cardElementOptions} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <CardExpiryElement options={cardElementOptions} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <CardCvcElement options={cardElementOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-500">
        <Lock className="h-4 w-4 mr-2" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-secondary-600 text-white px-4 py-2 rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency || 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(amount || 0)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  formData,
  itemId,
  type, 
  amount, 
  currency, 
  itemName,
  onSuccess,
  onError 
}) => {
  const [stripeInstance, setStripeInstance] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const initializeStripe = async () => {
        const stripe = await getStripe();
        setStripeInstance(stripe);
      };
      initializeStripe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!stripeInstance) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <Elements stripe={stripeInstance}>
          <CheckoutForm
            formData={formData}
            itemId={itemId}
            type={type}
            amount={amount}
            currency={currency}
            itemName={itemName}
            onSuccess={onSuccess}
            onError={onError}
            onClose={onClose}
          />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentModal;
