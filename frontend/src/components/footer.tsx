import { Box, Link, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "white",
        color: "#555",
        padding: "8px 16px",
        width: "100%",
        borderTop: "0.5px solid #ddd",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
        // position: "fixed", // 제거
        // bottom: 0, // 제거
        // left: 0, // 제거
        // zIndex: 1000, // 제거
      }}
    >
      {/* 좌측 정보 */}
      <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
        <Typography variant="body2" sx={{ fontSize: "13px", color: "#555" }}>
          야구 용품 전문 쇼핑몰
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "13px", color: "#555" }}>
          주소: 행복한 창현이집
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "13px", color: "#555" }}>
          사업자 등록번호: 010-2750-2936
        </Typography>
      </Box>

      {/* 중앙 저작권 */}
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="caption" sx={{ fontSize: "10px", color: "#777" }}>
          © 2025 야구 용품 전문 쇼핑몰. All rights reserved.
        </Typography>
      </Box>

      {/* 우측 링크 */}
      <Box sx={{ flexShrink: 0, textAlign: { xs: "center", sm: "right" } }}>
        <Link
          href="https://www.google.com/maps/place/37.498095,127.027610"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "#888", textDecoration: "none", fontSize: "15px", mr: 2, "&:hover": { textDecoration: "underline" } }}
        >
          찾아오시는 길
        </Link>
        <Link
          href="/terms"
          sx={{ color: "#888", textDecoration: "none", fontSize: "11px", mr: 2, "&:hover": { textDecoration: "underline" } }}
        >
          약관
        </Link>
        <Link
          href="/privacy"
          sx={{ color: "#888", textDecoration: "none", fontSize: "11px", "&:hover": { textDecoration: "underline" } }}
        >
          개인정보처리방침
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;