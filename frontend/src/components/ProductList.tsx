import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

interface Product {
  id: string; // AWS 환경에서는 보통 문자열 ID 사용
  name: string;
  description: string;
  price: number;
  stock: number;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8092";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ 
    name: "", 
    description: "", 
    price: 0, 
    stock: 0 
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data);
    } catch (err) {
      console.log(err)
      setError("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      setError("Product name is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/products`, newProduct);
      await fetchProducts();
      setNewProduct({ name: "", description: "", price: 0, stock: 0 });
    } catch (err) {
      console.log(err)
      setError("Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      await fetchProducts();
    } catch (err) {
      console.log(err)
      setError("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setIsLoading(true);
    setError(null);
    try {
      await axios.put(`${API_BASE_URL}/api/products/${editingProduct.id}`, editingProduct);
      await fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      console.log(err)
      setError("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Baseball Products
      </Typography>

      {error && (
        <Typography color="error" style={{ marginBottom: "16px" }}>
          {error}
        </Typography>
      )}

      {/* Add Product Form */}
      <Paper style={{ padding: "16px", marginBottom: "20px" }}>
        <Typography variant="h6">Add New Product</Typography>
        <TextField 
          label="Name" 
          fullWidth 
          margin="normal" 
          value={newProduct.name} 
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
        />
        <TextField 
          label="Description" 
          fullWidth 
          margin="normal" 
          value={newProduct.description} 
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
        />
        <TextField 
          label="Price" 
          type="number" 
          fullWidth 
          margin="normal" 
          value={newProduct.price} 
          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} 
        />
        <TextField 
          label="Stock" 
          type="number" 
          fullWidth 
          margin="normal" 
          value={newProduct.stock} 
          onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} 
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddProduct} 
          disabled={isLoading}
          style={{ marginTop: "10px" }}
        >
          {isLoading ? "Adding..." : "Add Product"}
        </Button>
      </Paper>

      {/* Product List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.price.toLocaleString()}원</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => setEditingProduct(product)} 
                      style={{ marginRight: "5px" }}
                      disabled={isLoading}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No products found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Product Form */}
      {editingProduct && (
        <Paper style={{ padding: "16px", marginTop: "20px" }}>
          <Typography variant="h6">Edit Product</Typography>
          <TextField 
            label="Name" 
            fullWidth 
            margin="normal" 
            value={editingProduct.name} 
            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} 
          />
          <TextField 
            label="Description" 
            fullWidth 
            margin="normal" 
            value={editingProduct.description} 
            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} 
          />
          <TextField 
            label="Price" 
            type="number" 
            fullWidth 
            margin="normal" 
            value={editingProduct.price} 
            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} 
          />
          <TextField 
            label="Stock" 
            type="number" 
            fullWidth 
            margin="normal" 
            value={editingProduct.stock} 
            onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} 
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpdateProduct} 
            disabled={isLoading}
            style={{ marginTop: "10px", marginRight: "10px" }}
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => setEditingProduct(null)} 
            disabled={isLoading}
            style={{ marginTop: "10px" }}
          >
            Cancel
          </Button>
        </Paper>
      )}
    </Container>
  );
}