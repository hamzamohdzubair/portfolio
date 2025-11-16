// Payment Modal and Coupon Code Functionality
// Module configuration - can be customized per module
const MODULE_CONFIG = {
  moduleId: 'module-01',
  moduleName: 'Python Programming Foundations',
  registrationFee: 299,
  totalCourseFee: 2998,
  remainingFee: 2699,
  currency: '₹',
};

// Coupon codes database (in production, this should be on backend)
// Note: Discounts apply to registration fee only
const COUPON_CODES = {
  'EARLY50': { discount: 50, type: 'percentage', description: 'Early bird 50% off' },
  'SAVE100': { discount: 100, type: 'fixed', description: 'Fixed ₹100 discount' },
  'WELCOME20': { discount: 20, type: 'percentage', description: 'Welcome 20% off' },
};

// State management
let currentDiscount = 0;
let appliedCoupon = null;

// Modal functions
function openPaymentModal() {
  const modal = document.getElementById('paymentModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Reset form and pricing when opening
  resetModalState();
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('paymentModal');

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closePaymentModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closePaymentModal();
    }
  });
});

function resetModalState() {
  // Reset discount
  currentDiscount = 0;
  appliedCoupon = null;

  // Reset form
  document.getElementById('studentDetailsForm').reset();
  document.getElementById('couponCode').value = '';

  // Reset pricing display
  updatePricing();

  // Clear coupon message
  const couponMessage = document.getElementById('couponMessage');
  couponMessage.className = 'coupon-message';
  couponMessage.textContent = '';
}

// Coupon code validation and application
function applyCoupon() {
  const couponInput = document.getElementById('couponCode');
  const couponCode = couponInput.value.trim().toUpperCase();
  const couponMessage = document.getElementById('couponMessage');

  if (!couponCode) {
    showCouponMessage('Please enter a coupon code', 'error');
    return;
  }

  // Check if coupon exists
  if (COUPON_CODES[couponCode]) {
    const coupon = COUPON_CODES[couponCode];
    appliedCoupon = couponCode;

    // Calculate discount (on registration fee only)
    if (coupon.type === 'percentage') {
      currentDiscount = Math.round((MODULE_CONFIG.registrationFee * coupon.discount) / 100);
    } else {
      currentDiscount = coupon.discount;
    }

    // Ensure discount doesn't exceed registration fee
    currentDiscount = Math.min(currentDiscount, MODULE_CONFIG.registrationFee);

    // Update pricing display
    updatePricing();

    // Show success message
    showCouponMessage(
      `Coupon applied! ${coupon.description} - ${MODULE_CONFIG.currency}${currentDiscount} off`,
      'success'
    );

    // Disable coupon input
    couponInput.disabled = true;
    document.querySelector('.apply-coupon-btn').textContent = 'Applied ✓';
    document.querySelector('.apply-coupon-btn').disabled = true;
  } else {
    showCouponMessage('Invalid coupon code', 'error');
    currentDiscount = 0;
    appliedCoupon = null;
    updatePricing();
  }
}

function showCouponMessage(message, type) {
  const couponMessage = document.getElementById('couponMessage');
  couponMessage.textContent = message;
  couponMessage.className = `coupon-message ${type}`;
}

function updatePricing() {
  const registrationAmount = MODULE_CONFIG.registrationFee - currentDiscount;

  // Update discount row visibility
  const discountRow = document.getElementById('discountRow');
  const discountAmount = document.getElementById('discountAmount');

  if (currentDiscount > 0) {
    discountRow.style.display = 'flex';
    discountAmount.textContent = `-${MODULE_CONFIG.currency}${currentDiscount}`;
  } else {
    discountRow.style.display = 'none';
  }

  // Update registration amount (not total course fee)
  document.getElementById('totalAmount').textContent =
    `${MODULE_CONFIG.currency}${registrationAmount}`;
  document.getElementById('paymentButtonAmount').textContent =
    `${MODULE_CONFIG.currency}${registrationAmount}`;
}

// Payment initiation
function initiatePayment() {
  // Validate form
  const form = document.getElementById('studentDetailsForm');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Get form data
  const studentName = document.getElementById('studentName').value.trim();
  const studentEmail = document.getElementById('studentEmail').value.trim();
  const studentPhone = document.getElementById('studentPhone').value.trim();

  // Calculate final registration amount
  const registrationAmount = MODULE_CONFIG.registrationFee - currentDiscount;

  // Prepare payment data
  const paymentData = {
    moduleId: MODULE_CONFIG.moduleId,
    moduleName: MODULE_CONFIG.moduleName,
    registrationAmount: registrationAmount,
    originalRegistrationFee: MODULE_CONFIG.registrationFee,
    totalCourseFee: MODULE_CONFIG.totalCourseFee,
    remainingFee: MODULE_CONFIG.remainingFee,
    discount: currentDiscount,
    couponCode: appliedCoupon,
    studentDetails: {
      name: studentName,
      email: studentEmail,
      phone: studentPhone,
    },
    timestamp: new Date().toISOString(),
  };

  console.log('Payment Data:', paymentData);

  // Initialize Dodo Payments
  initiateDodoPayment(paymentData);
}

// Dodo Payments Integration
function initiateDodoPayment(paymentData) {
  // Product ID from Dodo Payments dashboard
  const DODO_PRODUCT_ID = 'pdt_9BQXkYIWr21RNb3K3SahQ';

  // Build Dodo Payments checkout URL with pre-filled customer data
  const baseUrl = 'https://checkout.dodopayments.com/buy';
  const firstName = paymentData.studentDetails.name.split(' ')[0] || paymentData.studentDetails.name;
  const lastName = paymentData.studentDetails.name.split(' ').slice(1).join(' ') || '';

  // Construct payment URL with query parameters
  const paymentParams = new URLSearchParams({
    quantity: '1',
    email: paymentData.studentDetails.email,
    firstName: firstName,
    redirect_url: `${window.location.origin}/courses/tsi/success.html`,
  });

  // Add lastName if available
  if (lastName) {
    paymentParams.append('lastName', lastName);
  }

  // Build full checkout URL
  const checkoutUrl = `${baseUrl}/${DODO_PRODUCT_ID}?${paymentParams.toString()}`;

  // Log payment data for debugging
  console.log('Redirecting to Dodo Payments:', {
    productId: DODO_PRODUCT_ID,
    student: paymentData.studentDetails,
    amount: paymentData.registrationAmount,
    checkoutUrl: checkoutUrl,
  });

  // Redirect to Dodo Payments hosted checkout
  window.location.href = checkoutUrl;

  // Note: After successful payment, Dodo will redirect back to your success.html page
  // You'll need to set up webhooks to verify payment and enroll the student in your database
}

function handlePaymentSuccess(response, paymentData) {
  console.log('Payment successful:', response);

  // Close payment modal
  closePaymentModal();

  // Show success message
  showSuccessMessage(paymentData);

  // In production, send this data to your backend for verification and enrollment
  sendPaymentDataToBackend(response, paymentData);
}

function handlePaymentCancelled() {
  console.log('Payment cancelled by user');
  alert('Payment cancelled. You can try again when ready.');
}

function handlePaymentError(error) {
  console.error('Payment error:', error);
  alert('Payment failed. Please try again or contact support.');
}

function showSuccessMessage(paymentData) {
  // Create and show success notification
  const successHTML = `
    <div class="payment-success-overlay" id="successOverlay">
      <div class="success-card">
        <div class="success-icon">✓</div>
        <h2 class="success-title">Registration Successful!</h2>
        <p class="success-message">
          Congratulations ${paymentData.studentDetails.name}!<br>
          You have successfully enrolled in ${paymentData.moduleName}.
        </p>
        <p class="success-details">
          A confirmation email has been sent to ${paymentData.studentDetails.email}
        </p>
        <button class="success-button" onclick="closeSuccessMessage()">
          Continue
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', successHTML);

  // Add success overlay styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .payment-success-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    }

    .success-card {
      background: rgba(30, 30, 50, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 50px;
      text-align: center;
      max-width: 500px;
      animation: scaleIn 0.4s ease;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: white;
      margin: 0 auto 25px;
      animation: successPop 0.5s ease 0.2s both;
    }

    .success-title {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-bottom: 15px;
    }

    .success-message {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .success-details {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 30px;
    }

    .success-button {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border: none;
      color: white;
      padding: 15px 40px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .success-button:hover {
      transform: translateY(-2px);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes successPop {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

function closeSuccessMessage() {
  const overlay = document.getElementById('successOverlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  }
}

function sendPaymentDataToBackend(response, paymentData) {
  // In production, send this to your backend API
  const backendData = {
    paymentResponse: response,
    paymentData: paymentData,
  };

  console.log('Data to send to backend:', backendData);

  // Example backend call:
  /*
  fetch('/api/payment/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendData),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Backend response:', data);
      // Handle enrollment confirmation
    })
    .catch(error => {
      console.error('Backend error:', error);
    });
  */
}

// Allow coupon input to be re-enabled if needed
function removeCoupon() {
  const couponInput = document.getElementById('couponCode');
  const applyButton = document.querySelector('.apply-coupon-btn');

  currentDiscount = 0;
  appliedCoupon = null;
  couponInput.value = '';
  couponInput.disabled = false;
  applyButton.textContent = 'Apply';
  applyButton.disabled = false;

  updatePricing();

  const couponMessage = document.getElementById('couponMessage');
  couponMessage.className = 'coupon-message';
  couponMessage.textContent = '';
}

// Allow Enter key to apply coupon
document.addEventListener('DOMContentLoaded', function () {
  const couponInput = document.getElementById('couponCode');
  if (couponInput) {
    couponInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCoupon();
      }
    });
  }
});
