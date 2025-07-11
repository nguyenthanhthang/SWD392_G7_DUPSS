import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import BubbleBackground from "../components/BubbleBackground";
import VerificationAlert from "../components/VerificationAlert";
import HomePic from "../assets/Home.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <VerificationAlert />
      <BubbleBackground />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Banner Section */}
        <div className="mx-auto max-w-7xl my-10 sm:py-10 px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 my-16">
            {/* COLUMN-1 */}
            <div className="mx-auto sm:mx-0 mt-8">
              <div className="py-3 text-center lg:text-start">
                <button className="text-blue-600 bg-blue-100 hover:shadow-xl text-sm md:text-lg font-bold px-6 py-1 rounded-3xl tracking-wider hover:text-white hover:bg-blue-700">
                  PHÒNG CHỐNG MA TÚY
                </button>
              </div>
              <div className="py-3 text-center lg:text-start">
                <h1
                  className="text-6xl lg:text-7xl font-bold text-black"
                  style={{
                    fontFamily: "'Fira Sans', 'Poppins', 'Nunito', sans-serif",
                  }}
                >
                  Đoàn kết là <br /> sức mạnh, <br /> tin tưởng là ánh sáng
                </h1>
              </div>
              <div className="my-7 text-center lg:text-start">
                <button
                  className="text-sm md:text-xl font-semibold hover:shadow-xl bg-blue-600 text-white py-3 px-6 md:py-5 md:px-14 rounded-full hover:bg-blue-700"
                  onClick={() => navigate("/quizz")}
                >
                  Làm trắc nghiệm
                </button>
              </div>
            </div>
            {/* COLUMN-2 */}
            <div className="hidden lg:flex items-center justify-center px-8">
              <img
                src={HomePic}
                alt="hero-image"
                className="w-[380px] h-auto rounded-3xl object-cover transform scale-150 -translate-x-8"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
