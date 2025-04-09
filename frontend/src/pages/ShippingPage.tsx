import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from "@mui/material";

interface ShippingOrder {
  id: number;
  orderNumber: string;
  productName: string;
  status: string;
  orderedAt: string;
  estimatedDelivery: string;
}

export default function ShippingPage() {
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // 임시 데이터 (API가 없으므로 더미 데이터 사용)
        const dummyOrders: ShippingOrder[] = [
          {
            id: 1,
            orderNumber: "ORD12345",
            productName: "야구 배트",
            status: "배송 중",
            orderedAt: "2025-04-01",
            estimatedDelivery: "2025-04-05",
          },
          {
            id: 2,
            orderNumber: "ORD12346",
            productName: "야구 글러브",
            status: "배송 완료",
            orderedAt: "2025-03-28",
            estimatedDelivery: "2025-04-02",
          },
        ];
        setOrders(dummyOrders);
      } catch (err) {
        console.log(err);
        setError("배송 정보를 불러오는 데 실패했습니다. 나중에 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", marginTop: 8, p: { xs: 2, sm: 3 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 2,
          bgcolor: "#ffffff",
          minHeight: "80vh",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#333", mb: 3, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          배송 조회
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : orders.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#757575", mt: 2 }}>
            주문 내역이 없습니다.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    주문 번호
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    상품명
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    상태
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    주문일
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    예상 배송일
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      {order.orderNumber}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      {order.productName}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      {order.status}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      {order.orderedAt}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      {order.estimatedDelivery}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}