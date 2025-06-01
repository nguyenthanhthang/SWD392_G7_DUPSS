import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useState } from 'react';

// Dữ liệu cứng cho About Us
const aboutData = [
  {
    heading: "About us.",
    imgSrc: "https://themewagon.github.io/Desgy//images/aboutus/imgOne.svg",
    paragraph: "Chúng tôi cung cấp giải pháp hỗ trợ phòng ngừa và tư vấn về nguy cơ nghiện ma túy, giúp cộng đồng sống khỏe mạnh hơn.",
    link: "Learn more"
  },
  {
    heading: "Services.",
    imgSrc: "https://themewagon.github.io/Desgy//images/aboutus/imgTwo.svg",
    paragraph: "Dịch vụ kiểm tra mức độ nghiện, tư vấn cá nhân hóa, kết nối chuyên gia và cung cấp tài liệu phòng ngừa.",
    link: "Learn more"
  },
  {
    heading: "Our Works.",
    imgSrc: "https://themewagon.github.io/Desgy//images/aboutus/imgTwo.svg",
    paragraph: "Chúng tôi đã hỗ trợ hàng ngàn cá nhân và gia đình vượt qua nguy cơ nghiện, xây dựng cộng đồng an toàn hơn.",
    link: "Learn more"
  }
];

// Dữ liệu cứng cho Consultant
const consultantData = [
  {
    name: "Nguyễn Văn A",
    profession: "Chuyên gia tư vấn",
    imgSrc: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Trần Thị B",
    profession: "Chuyên gia tâm lý",
    imgSrc: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Lê Văn C",
    profession: "Bác sĩ trị liệu",
    imgSrc: "https://randomuser.me/api/portraits/men/34.jpg"
  },
  {
    name: "Phạm Thị D",
    profession: "Chuyên gia xã hội",
    imgSrc: "https://randomuser.me/api/portraits/women/45.jpg"
  }
];

// Dữ liệu cứng cho Blog
const postData = [
  {
    imgSrc: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    time: "5 min",
    heading: "We Launch Delia Webflow this Week!",
    heading2: "",
    name: "Published on Startupon",
    date: "August 19, 2021"
  },
  {
    imgSrc: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
    time: "5 min",
    heading: "Chia sẻ kinh nghiệm vượt qua nguy cơ nghiện",
    heading2: "",
    name: "Published on Startupon",
    date: "August 20, 2021"
  },
  {
    imgSrc: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    time: "5 min",
    heading: "Tư vấn sức khỏe tâm thần cho cộng đồng",
    heading2: "",
    name: "Published on Startupon",
    date: "August 21, 2021"
  }
];

export default function Home() {
  // State cho slider Consultant
  const [consultantIndex, setConsultantIndex] = useState(0);
  const visibleConsultant = 3;
  const maxConsultant = consultantData.length - visibleConsultant;

  // State cho slider Latest Posts
  const [postIndex, setPostIndex] = useState(0);
  const visiblePost = 3;
  const maxPost = postData.length - visiblePost;

  return (
    <div>
      <Header />
      {/* Banner Section */}
      <div className='mx-auto max-w-7xl my-10 sm:py-10 px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-24 my-16'>
          {/* COLUMN-1 */}
          <div className="mx-auto sm:mx-0 mt-8">
            <div className='py-3 text-center lg:text-start'>
              <button className='text-blue-600 bg-blue-100 hover:shadow-xl text-sm md:text-lg font-bold px-6 py-1 rounded-3xl tracking-wider hover:text-white hover:bg-blue-700'>DRUG USE PREVENTION</button>
            </div>
            <div className="py-3 text-center lg:text-start">
              <h1 className='text-6xl lg:text-7xl font-bold text-black' style={{ fontFamily: "'Fira Sans', 'Poppins', 'Nunito', sans-serif" }}>
               Together is <br /> strength, <br /> trust is light
              </h1>
            </div>
            <div className='my-7 text-center lg:text-start'>
              <button className='text-sm md:text-xl font-semibold hover:shadow-xl bg-blue-600 text-white py-3 px-6 md:py-5 md:px-14 rounded-full hover:bg-blue-700'>
                Take Quiz
              </button>
            </div>  
          </div>
          {/* COLUMN-2 */}
          <div className='hidden lg:flex items-center justify-center px-8'>
            <img 
              src="https://i.pinimg.com/736x/20/6b/7a/206b7a7b24465fc83456a5ae20176d4f.jpg" 
              alt="hero-image" 
              className="w-[380px] h-auto rounded-3xl object-cover transform scale-150 -translate-x-8" 
            />
          </div>
        </div>
      </div>
      {/* About Us Section */}
      <div id="aboutus-section">
        <div className='mx-auto max-w-7xl px-4 py-24 my-32 lg:px-10 bg-gray-100 rounded-3xl relative'>
          <h3 className='text-center text-blue-600 text-lg tracking-widest'>ABOUT US</h3>
          <h4 className='text-center text-4xl lg:text-6xl font-bold'>Know more about us.</h4>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 my-16 gap-x-16 lg:gap-x-32'>
            {aboutData.map((item, i) => (
              <div key={i} className='hover:bg-blue-600 bg-white rounded-3xl mt-16 pt-10 pl-8 pb-10 pr-6 shadow-xl group transition-colors h-200'> {/* thêm chiều cao cố định */}
                <h4 className='text-4xl font-semibold text-black mb-5 group-hover:text-white'>{item.heading}</h4>
                <img src={item.imgSrc} alt={item.imgSrc} width={100} height={100} className="mb-5" />
                <h4 className='text-lg font-normal text-black group-hover:text-white mb-5 line-clamp-3'> {/* thêm line-clamp-3 */}
                  {item.paragraph}
                </h4>
                <a href="#" className='text-lg font-semibold group-hover:text-white text-blue-600 hover:underline'>
                  {item.link}
                  <span className="inline-block ml-1">→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Consultant Slider Section */}
      <div className="bg-blue-50 py-32 w-full">
        <div className='mx-auto w-full sm:py-4 px-0 lg:px-0'>
          <div className="text-center mb-12">
            <h3 className="text-4xl sm:text-6xl font-bold text-black my-2">Đội ngũ chuyên gia tư vấn</h3>
            <h3 className="text-4xl sm:text-6xl font-bold text-black opacity-50 lg:mr-48 my-2">Đội ngũ chuyên gia tư vấn</h3>
            <h3 className="text-4xl sm:text-6xl font-bold text-black opacity-25 lg:-mr-32 my-2">Đội ngũ chuyên gia tư vấn</h3>
          </div>
          <div className="relative w-full flex items-center">
            {/* Nút trái */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 w-10 h-10 flex items-center justify-center rounded-full shadow hover:bg-blue-100 transition disabled:opacity-30"
              onClick={() => setConsultantIndex(i => Math.max(i - 1, 0))}
              disabled={consultantIndex === 0}
              aria-label="Prev"
            >
              <span className="text-lg">&#8592;</span>
            </button>
            {/* Slider */}
            <div className="w-full overflow-hidden px-12">
              <div
                className="flex gap-8 justify-center transition-transform duration-300"
                style={{ transform: `translateX(-${consultantIndex * (100 / visibleConsultant)}%)` }}
              >
                {consultantData.map((item, i) => (
                  <div key={i} className='bg-white m-3 py-14 my-10 text-center shadow-xl rounded-3xl min-w-[320px] w-[350px] flex-shrink-0'>
                    <div className='relative flex flex-col items-center'>
                      <img src={item.imgSrc} alt={item.name} width={182} height={182} className="inline-block m-auto rounded-full" />
                      <img src='https://cdn-icons-png.flaticon.com/512/174/174857.png' alt="linkedin" width={48} height={48} className="absolute bottom-0 right-1/2 translate-x-1/2 bg-white rounded-full border-2 border-blue-600 p-1" />
                    </div>
                    <h4 className='text-4xl font-bold pt-14'>{item.name}</h4>
                    <h3 className='text-2xl font-normal pt-4 pb-2 opacity-50'>{item.profession}</h3>
                  </div>
                ))}
              </div>
            </div>
            {/* Nút phải */}
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 w-10 h-10 flex items-center justify-center rounded-full shadow hover:bg-blue-100 transition disabled:opacity-30"
              onClick={() => setConsultantIndex(i => Math.min(i + 1, maxConsultant))}
              disabled={consultantIndex === maxConsultant}
              aria-label="Next"
            >
              <span className="text-lg">&#8594;</span>
            </button>
          </div>
        </div>
      </div>
      {/* Latest Posts Section */}
      <div className="bg-gray-50 py-20 w-full" id="blog-section">
        <div className='mx-auto w-full sm:py-4 px-0 lg:px-0'>
          <div className="text-center">
            <h3 className="text-blue-600 text-lg font-normal tracking-widest">ARTICLES</h3>
            <h3 className="text-4xl sm:text-6xl font-bold">Our latest post.</h3>
          </div>
          <div className="relative w-full flex items-center mt-12">
            {/* Nút trái */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 w-10 h-10 flex items-center justify-center rounded-full shadow hover:bg-blue-100 transition disabled:opacity-30"
              onClick={() => setPostIndex(i => Math.max(i - 1, 0))}
              disabled={postIndex === 0}
              aria-label="Prev"
            >
              <span className="text-lg">&#8592;</span>
            </button>
            {/* Slider */}
            <div className="w-full overflow-hidden px-12">
              <div
                className="flex gap-8 justify-center transition-transform duration-300"
                style={{ transform: `translateX(-${postIndex * (100 / visiblePost)}%)` }}
              >
                {postData.map((items, i) => (
                  <div key={i} className='bg-white m-3 px-3 pt-3 pb-12 my-10 shadow-lg rounded-3xl relative min-w-[380px] max-w-[400px] w-[400px] flex-shrink-0'>
                    <img src={items.imgSrc} alt="post" width={389} height={262} className="inline-block m-auto rounded-2xl" />
                    <a href="/" className="absolute bg-blue-600 text-white hover:bg-black hover:shadow-xl py-3 px-6 rounded-full article-img left-1/2 -translate-x-1/2 top-40">{items.time} read</a>
                    <h4 className='text-2xl font-bold pt-6 text-black'>{items.heading}</h4>
                    {items.heading2 && <h4 className='text-2xl font-bold pt-1 text-black'>{items.heading2}</h4>}
                    <div>
                      <h3 className='text-base font-normal pt-6 pb-2 opacity-75'>{items.name}</h3>
                      <h3 className='text-base font-normal pb-1 opacity-75'>{items.date}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Nút phải */}
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 w-10 h-10 flex items-center justify-center rounded-full shadow hover:bg-blue-100 transition disabled:opacity-30"
              onClick={() => setPostIndex(i => Math.min(i + 1, maxPost))}
              disabled={postIndex === maxPost}
              aria-label="Next"
            >
              <span className="text-lg">&#8594;</span>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
