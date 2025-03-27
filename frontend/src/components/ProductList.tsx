import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../types/Product";
import { Container, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: 0, stock: 0 });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 🔥 상품 목록 조회
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get("http://localhost:8092/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("상품 목록 불러오기 오류:", err));
  };

  // 🔥 상품 추가
  const handleAddProduct = () => {
    axios.post("http://localhost:8092/api/products", newProduct)
      .then(() => {
        fetchProducts(); // 추가 후 목록 새로고침
        setNewProduct({ name: "", description: "", price: 0, stock: 0 }); // 입력값 초기화
      })
      .catch((err) => console.error("상품 추가 오류:", err));
  };

  // 🔥 상품 삭제
  const handleDeleteProduct = (id: number) => {
    axios.delete(`http://localhost:8092/api/products/${id}`)
      .then(() => fetchProducts()) // 삭제 후 목록 새로고침
      .catch((err) => console.error("상품 삭제 오류:", err));
  };

  // 🔥 상품 수정 모드 활성화
  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  // 🔥 상품 업데이트
  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    axios.put(`http://localhost:8092/api/products/${editingProduct.id}`, editingProduct)
      .then(() => {
        fetchProducts(); // 업데이트 후 목록 새로고침
        setEditingProduct(null); // 수정 모드 종료
      })
      .catch((err) => console.error("상품 수정 오류:", err));
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        야구 용품 목록
      </Typography>

      {/* 🔥 상품 추가 폼 */}
      <Paper style={{ padding: "16px", marginBottom: "20px" }}>
        <Typography variant="h6">상품 추가</Typography>
        <TextField label="상품명" fullWidth margin="normal" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
        <TextField label="설명" fullWidth margin="normal" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
        <TextField label="가격" type="number" fullWidth margin="normal" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
        <TextField label="재고" type="number" fullWidth margin="normal" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} />
        <Button variant="contained" color="primary" onClick={handleAddProduct} style={{ marginTop: "10px" }}>상품 추가</Button>
      </Paper>

      {/* 🔥 상품 목록 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>상품명</TableCell>
              <TableCell>설명</TableCell>
              <TableCell>가격</TableCell>
              <TableCell>재고</TableCell>
              <TableCell>관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.price}원</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="secondary" onClick={() => startEditProduct(product)} style={{ marginRight: "5px" }}>
                      수정
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleDeleteProduct(product.id)}>
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">상품이 없습니다.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🔥 상품 수정 폼 */}
      {editingProduct && (
        <Paper style={{ padding: "16px", marginTop: "20px" }}>
          <Typography variant="h6">상품 수정</Typography>
          <TextField label="상품명" fullWidth margin="normal" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
          <TextField label="설명" fullWidth margin="normal" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
          <TextField label="가격" type="number" fullWidth margin="normal" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} />
          <TextField label="재고" type="number" fullWidth margin="normal" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} />
          <Button variant="contained" color="primary" onClick={handleUpdateProduct} style={{ marginTop: "10px", marginRight: "10px" }}>수정 완료</Button>
          <Button variant="outlined" onClick={() => setEditingProduct(null)} style={{ marginTop: "10px" }}>취소</Button>
        </Paper>
      )}
    </Container>
  );
}
