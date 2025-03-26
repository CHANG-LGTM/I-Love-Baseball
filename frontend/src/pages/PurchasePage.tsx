import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Alert,
} from "@mui/material";
import axios from "axios";
import PortOne from "@portone/browser-sdk/v2";

declare global {
  interface Window {
    DaumPostcode: any;
    PortOne?: any;
  }
}

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Address {
  mainAddress: string;
  detailAddress: string;
}

const PurchasePage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>(state?.cartItems || []);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<Address>({ mainAddress: "", detailAddress: "" });
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [daumPostcodeLoaded, setDaumPostcodeLoaded] = useState<boolean>(false);
  const [portOneLoaded, setPortOneLoaded] = useState<boolean>(false);

  const nickname = localStorage.getItem("nickname");
  const isLoggedIn = !!nickname;

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    if (!isLoggedIn) {
      setError("로그인 후 구매 가능합니다.");
      setTimeout(() => {
        if (window.confirm("로그인 후 구매 가능합니다. 로그인 하시겠습니까?")) {
          navigate("/login", { state: { from: window.location.pathname, cartItems } });
        } else {
          navigate("/");
        }
      }, 1000);
    }
  }, [isLoggedIn, navigate, cartItems]);

  // Daum Postcode API 로드
  useEffect(() => {
    const daumScript = document.createElement("script");
    daumScript.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    daumScript.async = true;
    daumScript.onload = () => {
      console.log("Daum Postcode API loaded successfully");
      setDaumPostcodeLoaded(true);
    };
    daumScript.onerror = () => {
      console.error("Failed to load Daum Postcode API");
      setError("주소 검색 API 로드가 실패했습니다. 네트워크를 확인해 주세요.");
    };
    document.body.appendChild(daumScript);

    return () => {
      document.body.removeChild(daumScript);
    };
  }, []);

  // 포트원 SDK 로드 확인
  useEffect(() => {
    if (typeof PortOne !== "undefined") {
      setPortOneLoaded(true);
    } else {
      setError("포트원 결제 SDK를 로드할 수 없습니다. 네트워크를 확인해 주세요.");
    }
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePostcode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!daumPostcodeLoaded) {
      setError("주소 검색 API가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (!window.daum?.Postcode) {
      setError("주소 검색 API를 찾을 수 없습니다. 페이지를 새로고침해 주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const fullAddress = data.address;
        const extraAddress = data.bname ? ` (${data.bname})` : "";
        setAddress({
          mainAddress: `${fullAddress}${extraAddress}`,
          detailAddress: address.detailAddress,
        });
      },
    }).open();
  };

  const handlePayment = async () => {
    if (!isLoggedIn) {
      setError("로그인 후 구매가 가능합니다.");
      return;
    }
    if (!cartItems.length || !name || !phone || !address.mainAddress) {
      setError("필수 정보를 모두 입력해 주세요.");
      return;
    }
    if (!portOneLoaded) {
      setError("포트원 결제 SDK가 로드되지 않았습니다. 페이지를 새로고침해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        amount: calculateTotal(),
        orderName: cartItems.map((item) => item.name).join(", "),
        customerName: name,
        customerPhone: phone,
        customerAddress: `${address.mainAddress} ${address.detailAddress}`,
        paymentMethod,
        cartItems: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await axios.post("http://localhost:8092/api/payments/portone", orderData, {
        withCredentials: true,
      });

      const { orderId } = response.data;

      const paymentResponse = await PortOne.requestPayment({
        storeId: "store-1928f2a9-df1e-4126-9f6f-d9ac630a7825",
        channelKey: "channel-key-4e815d5c-761a-4bce-967f-6453080e9b7e",
        paymentId: `payment-${orderId}-${Date.now()}`,
        orderName: orderData.orderName,
        totalAmount: orderData.amount,
        currency: "CURRENCY_KRW",
        payMethod: paymentMethod === "card" ? "CARD" : "TRANSFER",
        customData: {
          item: orderData.orderName,
        },
        redirectUrl: `http://localhost:3000/purchase/${orderId}`,
      });

      if (paymentResponse.status === "PAID") {
        await axios.post(
          "http://localhost:8092/api/payments/portone/verify",
          null,
          {
            params: {
              paymentKey: paymentResponse.paymentKey,
              orderId: orderId,
            },
            withCredentials: true,
          }
        );
        navigate(`/purchase/${orderId}`);
      } else {
        setError("결제가 취소되었거나 실패했습니다.");
      }
    } catch (err: any) {
      console.error("결제 요청 실패:", err);
      if (err.response?.status === 401) {
        setError("인증이 필요합니다. 다시 로그인해 주세요.");
        localStorage.removeItem("nickname");
        localStorage.removeItem("token");
        setTimeout(() => {
          navigate("/login", { state: { from: window.location.pathname, cartItems } });
        }, 1000);
      } else {
        setError("결제 요청에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return <Typography align="center">장바구니가 비어 있습니다.</Typography>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card sx={{ p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            주문 정보
          </Typography>
          {cartItems.map((item) => (
            <Box key={item.id} sx={{ mb: 2, display: "flex", alignItems: "center" }}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: 80, height: 80, objectFit: "contain", marginRight: 16 }}
              />
              <Box>
                <Typography variant="body1">{item.name}</Typography>
                <Typography variant="body2">
                  {item.price.toLocaleString()}원 x {item.quantity}개
                </Typography>
              </Box>
            </Box>
          ))}
          <Typography variant="h5" color="primary" gutterBottom>
            총 결제 금액: {calculateTotal().toLocaleString()}원
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="수령인 이름"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="연락처"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              inputProps={{ pattern: "[0-9]{10,11}" }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="주소"
              fullWidth
              value={address.mainAddress}
              InputProps={{
                readOnly: true,
              }}
              required
              sx={{ mb: 1 }}
            />
            <Button variant="outlined" onClick={handlePostcode} sx={{ mb: 2 }}>
              주소 검색
            </Button>
            <TextField
              label="상세 주소"
              fullWidth
              value={address.detailAddress}
              onChange={(e) => setAddress({ ...address, detailAddress: e.target.value })}
              required
            />
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>결제 방법</InputLabel>
            <Select
              value={paymentMethod}
              label="결제 방법"
              onChange={(e) => setPaymentMethod(e.target.value as string)}
            >
              <MenuItem value="card">신용카드</MenuItem>
              <MenuItem value="bank">계좌 이체</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handlePayment}
            disabled={loading}
            sx={{ mt: 2, py: 1.5 }}
          >
            {loading ? "결제 진행 중..." : `결제하기 (${calculateTotal().toLocaleString()}원)`}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PurchasePage;