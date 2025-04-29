import { useEffect, useState, useRef } from 'react';
import styles from '../css/PageCss/CheckoutPage.module.css';
import { useNavigate } from 'react-router';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';

interface CartItem {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size?: string;
}

interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  rank: string;
  createdAt: string;
}

function CheckoutPage() {
  const [checkoutProduct, setCheckoutProduct] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const token = Cookies.get('token');
  const navigate = useNavigate();
  const baseShippingFee = 25000;

  const addressRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const provinceRef = useRef<HTMLInputElement>(null);
  const districtRef = useRef<HTMLInputElement>(null);
  const wardRef = useRef<HTMLInputElement>(null);

  const GOONG_API_KEY = 'fQXEea6MuBVL4e6IouYHzhJkJ8AY8QPoPb9mEKDL';
  const sessionToken = crypto.randomUUID();

  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const userId = decoded.id;

          const response = await fetch(`http://localhost:3000/cart/${userId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error("Unable to load cart");
          const data = await response.json();
          setCheckoutProduct(data.dishes);
        } catch (error) {
          console.error(error);
        }
      }
    };

    const loadUserProfile = async () => {
      if (token) {
        try {
          const response = await fetch(`http://localhost:3000/user/profile`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error("Unable to load user information");
          const data = await response.json();
          if (data.success) {
            setUserProfile(data.user);
          }
        } catch (error) {
          console.error("Error loading user information:", error);
        }
      }
    };

    loadCart();
    loadUserProfile();
  }, [token]);

  //Goong Map
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const searchAddress = debounce(async (query: string) => {
    if (query.length < 2) {
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(query)}&sessiontoken=${sessionToken}`
      );
      const data = await response.json();
      console.log('Goong API response:', data);

      if (data.status === 'OK') {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      } else {
        console.error('Goong API error:', data.status, data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error when calling Goong API:', error);
    }
  }, 300);

  const handleSuggestionClick = (suggestion: any) => {
    console.log('Suggestion compound:', suggestion.compound);

    if (addressRef.current) {
      addressRef.current.value = suggestion.description || '';
    }

    if (suggestion.compound) {
      if (provinceRef.current) provinceRef.current.value = suggestion.compound.province || '';
      if (districtRef.current) districtRef.current.value = suggestion.compound.district || '';
      if (wardRef.current) wardRef.current.value = suggestion.compound.commune || '';
    }

    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressRef.current &&
        !addressRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //Voucherrrr
  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      toast.error('Please input voucher');
      return;
    }

    if (!token) {
      toast.error('Please login to apply voucher');
      return;
    }

    try {
      const currentUserId = jwtDecode<any>(token).id;

      const response = await fetch(`http://localhost:3000/vouchers/code/${voucherCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const voucher = data.data;

        if (voucher.userId) {
          if (voucher.userId._id !== currentUserId) {
            toast.error('This voucher is not valid for your account');
            return;
          }
        }

        setAppliedVoucher(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error when applied voucher');
    }
  };

  const handleChangeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  //Checkout
  const handleCheckout = async () => {
    if (!token || !userProfile) {
      toast.error("Please login to continue!");
      navigate('/login');
      return;
    }

    const deliveryAddress = addressRef.current?.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userProfile.fullname) {
      toast.error('Please enter your full name');
      return;
    }

    if (!userProfile.email) {
      toast.error('Please enter your email');
      return;
    }

    if (!emailRegex.test(userProfile.email)) {
      toast.error('Invalid email, please try again');
      return;
    }

    if (!userProfile.phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!deliveryAddress) {
      toast.error("Please enter your delivery address");
      return;
    }

    const checkoutData = {
      userId: jwtDecode<any>(token).id,
      contactPhone: userProfile.phoneNumber,
      deliveryAddress,
      totalAmount: getTotalPrice() - getVoucherDiscount() + getShippingFee(),
    };

    try {
      setIsLoading(true);

      const checkoutResponse = await fetch('http://localhost:3000/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutData),
      });

      const checkoutDataResponse = await checkoutResponse.json();

      if (!checkoutDataResponse.success) {
        toast.error(`ERROR: ${checkoutDataResponse.message}`);
        return;
      }

      const bookingId = checkoutDataResponse.bookingId;
      Cookies.set('bookingId', bookingId, { expires: 1, path: '/' });

      const orderId = checkoutDataResponse.orderId;
      const vnpayResponse = await fetch(`http://localhost:3000/payment/vnpay-create?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const vnpayData = await vnpayResponse.json();

      if (vnpayResponse.ok && vnpayData.paymentUrl) {
        if (appliedVoucher) {
          Cookies.set('VoucherId', appliedVoucher._id, { expires: 1, path: '/' });
        }

        Cookies.set('TotalAmount', `${checkoutData.totalAmount}`, { expires: 1, path: '/' });

        window.location.href = vnpayData.paymentUrl;
      } else {
        toast.error(`ERROR: ${vnpayData.error || 'Unable to generate payment URL'}`);
      }
    } catch (error) {
      console.error('Error during checkout or payment URL creation:', error);
      toast.error('An error occurred while processing your order');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPrice = () => {
    return checkoutProduct.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const getShippingFee = () => {
    const totalPrice = getTotalPrice();
    return (totalPrice >= 800000 || totalPrice === 0) ? 0 : baseShippingFee;
  };

  const getVoucherDiscount = () => {
    if (!appliedVoucher) return 0;
    const subtotal = getTotalPrice();
    return (subtotal * appliedVoucher.discount) / 100;
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        <h3 className={styles.brandName}>Ambrosia</h3>
        <p className={styles.orderTitle}>Delivery information</p>

        <form className={styles.checkoutForm}>
          <input
            className={styles.name}
            type='text'
            placeholder='Full Name'
            value={userProfile?.fullname || ''}
            onChange={(e) => setUserProfile({ ...userProfile!, fullname: e.target.value })}
          />

          <div className={styles.groupInput}>
            <input
              className={styles.email}
              type='text'
              placeholder='Email'
              value={userProfile?.email || ''}
              onChange={(e) => setUserProfile({ ...userProfile!, email: e.target.value })}
            />
            <input
              className={styles.phone}
              type='text'
              placeholder='Phone'
              value={userProfile?.phoneNumber || ''}
              onChange={(e) => setUserProfile({ ...userProfile!, phoneNumber: e.target.value })}
            />
          </div>

          <div className={styles.addressContainer}>
            <input
              ref={addressRef}
              className={styles.address}
              type="text"
              placeholder="Address"
              onChange={(e) => searchAddress(e.target.value)}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.description}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.groupInput} style={{ marginTop: '15px' }}>
            <input
              ref={provinceRef}
              type="text"
              className={styles.addressDetail}
              placeholder="Province/City"
            />
            <input
              ref={districtRef}
              type="text"
              className={styles.addressDetail}
              placeholder="District"
            />
            <input
              ref={wardRef}
              type="text"
              className={styles.addressDetail}
              placeholder="Ward/Commune"
            />
          </div>
        </form>

        <p className={styles.method}>Delivery method</p>
        <div className={styles.methodTitle}>
          <div>
            <input className={styles.checkBox} type='radio' id='ship' checked />
            <label htmlFor='ship'>Delivery to your location</label>
          </div>
          <p>{getShippingFee().toLocaleString()}₫</p>
        </div>

        <p className={styles.method}>Payment method</p>
        <div className={styles.methodTitle}>
          <div>
            <div>
              <input className={styles.checkBox} type='radio' id='payment' checked />
              <label htmlFor='payment'>Prepayment with VNPay</label>
            </div>
          </div>
        </div>

        <div className={styles.groupButton}>
          <button className={styles.backCart} onClick={() => navigate('/')}>&lt; Home</button>
          {!isLoading ? (
            <button className={styles.complete} onClick={handleCheckout}>Complete order</button>
          ) : (
            <button className={styles.complete} style={{ padding: '0 18px' }}>Completing...</button>
          )}
        </div>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.checkoutProduct}>
          {checkoutProduct.map((item) => (
            <div className={styles.checkoutGroup} key={item._id}>
              <div className={styles.productTitle}>
                <img src={item.imageUrl} alt='' />
                <div className={styles.infor}>
                  <p className={styles.productName}>{item.name}</p>
                </div>
                <p className={styles.quantity}>{item.quantity}</p>
              </div>
              <div className={styles.productPrice}>{(item.price * item.quantity).toLocaleString()}₫</div>
            </div>
          ))}
        </div>

        {!appliedVoucher ? (
          <div className={styles.voucher}>
            <input
              type="text"
              name="voucher"
              id="voucher"
              placeholder="Voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button onClick={handleApplyVoucher}>Apply</button>
          </div>
        ) : (
          <div className={styles.voucherApplied}>
            <div className={styles.flex} style={{ alignItems: "center" }}>
              <p className={styles.grey}>Voucher applied:</p>

              <div className={styles.applyBtn}>
                <p>{appliedVoucher.code} (-{appliedVoucher.discount}%)</p>
                <button className={styles.changeVoucher} onClick={handleChangeVoucher}>✖</button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.groupPrice}>
          <div className={styles.flex}>
            <p className={styles.grey}>Subtotal</p>
            <p>{getTotalPrice().toLocaleString()}₫</p>
          </div>

          <div className={styles.flex}>
            <p className={styles.grey}>Voucher</p>
            <p>- {getVoucherDiscount().toLocaleString()}₫</p>
          </div>

          <div className={styles.flex}>
            <p className={styles.grey}>Shipping fee</p>
            <p>{getShippingFee().toLocaleString()}₫</p>
          </div>
        </div>

        <div className={`${styles.groupPrice} ${styles.flex}`}>
          <p className={styles.fs20}>Total</p>
          <p className={styles.fs20}>{(getTotalPrice() + getShippingFee() - getVoucherDiscount()).toLocaleString()}₫</p>
        </div>
      </div>

      <ToastContainer theme="colored" />
    </div>
  );
}

export default CheckoutPage;