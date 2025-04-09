import { Box } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const ImageSlider = () => {
    const sliderImages = [
      "https://cdn-pro-web-213-28.cdn-nhncommerce.com/yayongsa11_godomall_com/data/skin/front/designbook_thegrandR/img/banner/b028cd1af60d8b4d77044205c8d7ffd5_41549.jpg",
      "https://cdn-pro-web-213-28.cdn-nhncommerce.com/yayongsa11_godomall_com/data/skin/front/designbook_thegrandR/img/banner/a3f17675fc39136bb73107ff7d60183f_24881.png",
      "https://cdn-pro-web-213-28.cdn-nhncommerce.com/yayongsa11_godomall_com/data/skin/front/designbook_thegrandR/img/banner/fde30ff57202cd01e4bebeed15a1d871_15876.jpg",
    ];
  
    const sliderSettings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      // 반응형 설정 추가
  responsive: [
    {
      breakpoint: 1200, // 1200px 이하에서 적용
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 600, // 600px 이하에서 적용 (필요 시 추가 조정)
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
    };
    return (
      <Box sx={{ mt: 15, mb: 4 }}>
        <Slider {...sliderSettings}>
          {sliderImages.map((image, index) => (
            <div key={index}>
              <img
                src={image}
                alt={`슬라이드 ${index + 1}`}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "400px",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />
            </div>
          ))}
        </Slider>
      </Box>
    );
  };
  
  export default ImageSlider;