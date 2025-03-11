import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Pagination, Box } from "@mui/material";
import axios from "axios";
import { Product } from "../types";

export default function ProductCategory() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // ✅ 한 페이지당 16개 (4x4)

  useEffect(() => {
    axios.get(`http://localhost:8092/api/products/category/${category}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("상품 목록 불러오기 오류:", err));
  }, [category]);

  // ✅ 페이지네이션을 위한 데이터 슬라이싱
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Container maxWidth="lg" sx={{ textAlign: "center", mt: 15 }}>
      {/* 🔥 제목을 가운데 정렬하고, 리스트와의 간격 추가 */}
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: "center", mb: 6 }}>
        {category === "bats" ? "야구배트"
          : category === "batting-gloves" ? "배팅장갑"
          : category === "protection" ? "보호장비"
          : category === "shoes" ? "야구화"  // ✅ 야구화 추가
          : "글러브"} 목록
      </Typography>

      {/* 🔥 4x4 그리드 (한 줄에 4개씩, 마지막 줄 왼쪽 정렬) */}
      <Grid container spacing={3} justifyContent="flex-start">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}> {/* ✅ md={3}로 4개씩 배치 */}
              <Card 
                sx={{ 
                  width: 280, // ✅ 기존 크기 유지
                  height: 330, // ✅ 기존 크기 유지
                  borderRadius: 4, 
                  boxShadow: 3, 
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 3 
                }}
              >
                {/* 이미지 영역 */}
                <CardMedia
                  component="img"
                  height="140"
                  image={product.image || "https://via.placeholder.com/200"}
                  alt={product.name}
                  sx={{ objectFit: "cover", width: "100%", borderRadius: 2 }}
                />

                {/* 상품 정보 */}
                <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold" display="block" 
                    sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {product.name}
                  </Typography>
                  <Typography color="textSecondary" fontSize="14px" sx={{ mt: 1, height: 40, overflow: "hidden", textAlign: "center" }}>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mt: 1 }}>
                    {product.price.toLocaleString()}원
                  </Typography>
                </CardContent>

                {/* 버튼 영역 */}
                <CardActions sx={{ width: "100%", justifyContent: "center", pb: 1 }}>
                  <Button variant="contained" color="primary" sx={{ width: "80%" }}>
                    구매하기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="h6" color="textSecondary" sx={{ mt: 5 }}>
            해당 카테고리에 상품이 없습니다.
          </Typography>
        )}
      </Grid>

      {/* 🔥 페이지네이션 (하단) */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}
