import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardMedia,
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

// 포트원 및 다음 주소 API 타입 선언
declare global {
  interface Window {
    PortOne: any;
    DaumPostcode: any;
  }
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  stock: number;
}

interface Address {
  mainAddress: string;
  detailAddress: string;
}

const PurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<Address>({ mainAddress: "", detailAddress: "" });
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [portOneLoaded, setPortOneLoaded] = useState<boolean>(false);
  const [daumPostcodeLoaded, setDaumPostcodeLoaded] = useState<boolean>(false);
  const postcodeRef = useRef<HTMLDivElement>(null);

  // 포트원 SDK 및 다음 주소 API 로드
  useEffect(() => {
    let isMounted = true;

    // 포트원 SDK
    const portOneScript = document.createElement("script");
    portOneScript.src = "https://cdn.iamport.kr/v1/iamport.js";
    portOneScript.async = true;
    portOneScript.onload = () => {
      if (isMounted) {
        console.log("PortOne SDK loaded successfully");
        setPortOneLoaded(true);
      }
    };
    portOneScript.onerror = () => {
      if (isMounted) {
        console.error("Failed to load PortOne SDK");
        setError("결제 시스템 로드가 실패했습니다. 네트워크를 확인해 주세요.");
      }
    };
    document.body.appendChild(portOneScript);

    // 다음 주소 API
    const daumScript = document.createElement("script");
    daumScript.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    daumScript.async = true;
    daumScript.onload = () => {
      if (isMounted) {
        console.log("Daum Postcode API loaded successfully");
        setDaumPostcodeLoaded(true);
      }
    };
    daumScript.onerror = () => {
      if (isMounted) {
        console.error("Failed to load Daum Postcode API");
        setError("주소 검색 API 로드가 실패했습니다. 네트워크를 확인해 주세요.");
      }
    };
    document.body.appendChild(daumScript);

    return () => {
      isMounted = false;
      document.body.removeChild(portOneScript);
      document.body.removeChild(daumScript);
    };
  }, []);

  // 상품 데이터 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log(`Fetching product with ID: ${id}`);
        const response = await axios.get(`http://localhost:8092/api/products/${id}`, {
          withCredentials: true,
        });
        console.log("Product data:", response.data);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error("상품 불러오기 오류:", err.response?.data || err.message);
        setError("상품을 불러오지 못했습니다. 서버 상태를 확인해 주세요.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    } else {
      setError("잘못된 상품 ID입니다.");
      setLoading(false);
    }
  }, [id]);

  // 로그인 상태 확인
  const nickname = localStorage.getItem("nickname");
  const isLoggedIn = !!nickname;

  useEffect(() => {
    if (!isLoggedIn) {
      if (window.confirm("로그인 후 구매 가능합니다. 로그인 하시겠습니까?")) {
        navigate("/login");
      }
    }
  }, [isLoggedIn, navigate]);

  // 총 결제 금액 계산
  const calculateTotal = () => {
    if (!product) return 0;
    const discountedPrice = 
    // Math.round(
    //   product.originalPrice * (1 - product.discountPercent / 100)
    // );
      product.price;
    return discountedPrice * quantity;
  };

  // 주소 검색 열기
  const handlePostcode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // 기본 동작 방지
    console.log("handlePostcode called");

    if (!daumPostcodeLoaded) {
      setError("주소 검색 API가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      console.log("DaumPostcode not loaded yet");
      return;
    }

    if (!window.DaumPostcode) {
      setError("주소 검색 API를 찾을 수 없습니다. 페이지를 새로고침해 주세요.");
      console.error("DaumPostcode is undefined");
      return;
    }

    new window.DaumPostcode({
      oncomplete: (data: any) => {
        const fullAddress = data.address;
        const extraAddress = data.bname ? ` (${data.bname})` : "";
        setAddress({
          mainAddress: `${fullAddress}${extraAddress}`,
          detailAddress: address.detailAddress,
        });
        console.log("Address selected:", `${fullAddress}${extraAddress}`);
      },
      onclose: () => {
        console.log("Postcode popup closed");
      },
    }).open();
  };

  // 포트원 결제 요청
  const handlePayment = async () => {
    if (!isLoggedIn) {
      setError("로그인 후 구매가 가능합니다.");
      return;
    }
    if (!product || quantity > product.stock || !name || !phone || !address.mainAddress) {
      setError("필수 정보를 모두 입력해 주세요. 재고를 확인하세요.");
      return;
    }

    if (!portOneLoaded) {
      setError("결제 시스템이 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    try {
      const { impUid, merchantUid, amount, success } = await new Promise((resolve) => {
        window.PortOne.requestPayment({
          pg: "html5_inicis",
          payMethod: paymentMethod === "card" ? "card" : "trans",
          merchantUid: `order_${Date.now()}`,
          amount: calculateTotal(),
          name: product.name,
          buyerName: name,
          buyerTel: phone,
          buyerAddr: `${address.mainAddress} ${address.detailAddress}`,
          mRedirectUrl: "http://localhost:5173/purchase/complete",
          onClick: (response: any) => {
            if (response.success) {
              resolve(response);
            } else {
              setError("결제 창이 닫혔습니다. 다시 시도해 주세요.");
              resolve({ success: false });
            }
          },
        });
      });

      if (success) {
        const orderData = {
          productId: product.id,
          quantity,
          name,
          phone,
          address: `${address.mainAddress} ${address.detailAddress}`,
          paymentMethod,
          totalAmount: calculateTotal(),
          impUid,
          merchantUid,
        };
        await axios.post("http://localhost:8092/api/orders", orderData, {
          withCredentials: true,
        });
        alert("결제가 완료되었습니다!");
        navigate("/");
      }
    } catch (err) {
      console.error("결제 실패:", err);
      setError("결제 처리에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  if (loading) return <Typography align="center">로딩 중...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!product) return <Typography align="center">상품을 찾을 수 없습니다.</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card sx={{ p: 2, boxShadow: 3 }}>
        <CardMedia
          component="img"
          height="300"
          image={product.image || "https://placehold.co/300x200"}
          alt={product.name}
          sx={{ objectFit: "contain" }}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {product.description}
          </Typography>
          { product.originalPrice &&
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" color="text.primary" sx={{ mr: 2 }}>
              원가: {product.originalPrice?.toLocaleString() ?? product.price}원
            </Typography>
            
            <Typography variant="h6" color="error">
              할인: {product.discountPercent}% OFF
            </Typography>  
            
          </Box>
          }
          <Typography variant="h5" color="primary" gutterBottom>
            판매가: {calculateTotal().toLocaleString()}원
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">수량:</Typography>
            <TextField
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))
              }
              inputProps={{ min: 1, max: product.stock }}
              sx={{ width: 100, mr: 2 }}
            />
            <Typography variant="body2">재고: {product.stock}개</Typography>
          </Box>
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
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handlePayment}
            sx={{ mt: 2, py: 1.5 }}
          >
            결제하기 ({calculateTotal().toLocaleString()}원)
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PurchasePage;