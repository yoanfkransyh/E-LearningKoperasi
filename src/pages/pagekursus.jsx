import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

import materi1 from "../assets/materi1.jpeg";
import materi2 from "../assets/materi2.jpeg";
import materi3 from "../assets/materi3.jpeg";
import materi4 from "../assets/materi4.jpeg";
import materi5 from "../assets/materi5.jpeg";
import materi6 from "../assets/materi6.jpeg";

const PageKursus = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [targetSlug, setTargetSlug] = useState(null);

  const { user } = useAuth(); 
  const navigate = useNavigate(); 

  const fallbackImages = [materi1, materi2, materi3, materi4, materi5, materi6];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCourses(
          data.map((course, index) => ({
            ...course,
            image:
              course.image_url || fallbackImages[index % fallbackImages.length], // Use uploaded image or fallback
          }))
        );
      } else {
        setCourses([
          {
            slug: "html-dasar",
            title: "Pengenalan HTML Dasar",
            description:
              "Pelajari struktur dasar HTML dan cara membuat halaman web pertama kamu.",
            image: materi1,
          },
          {
            slug: "css-pemula",
            title: "Dasar CSS untuk Pemula",
            description:
              "Pelajari cara mempercantik tampilan website menggunakan CSS.",
            image: materi2,
          },
          {
            slug: "javascript-fundamental",
            title: "Fundamental JavaScript",
            description:
              "Kuasai dasar logika pemrograman dengan JavaScript, bahasa wajib front-end.",
            image: materi3,
          },
          {
            slug: "react-modern",
            title: "Belajar React.js Modern",
            description:
              "Bangun aplikasi web interaktif dengan framework React yang populer.",
            image: materi4,
          },
          {
            slug: "api-backend",
            title: "Koneksi API dan Backend",
            description:
              "Pelajari cara menghubungkan front-end dengan API dan backend server.",
            image: materi5,
          },
          {
            slug: "deploy-website",
            title: "Deploy Website ke Internet",
            description:
              "Langkah-langkah praktis untuk meng-online-kan website kamu.",
            image: materi6,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([
        {
          slug: "html-dasar",
          title: "Pengenalan HTML Dasar",
          description:
            "Pelajari struktur dasar HTML dan cara membuat halaman web pertama kamu.",
          image: materi1,
        },
        {
          slug: "css-pemula",
          title: "Dasar CSS untuk Pemula",
          description:
            "Pelajari cara mempercantik tampilan website menggunakan CSS.",
          image: materi2,
        },
        {
          slug: "javascript-fundamental",
          title: "Fundamental JavaScript",
          description:
            "Kuasai dasar logika pemrograman dengan JavaScript, bahasa wajib front-end.",
          image: materi3,
        },
        {
          slug: "react-modern",
          title: "Belajar React.js Modern",
          description:
            "Bangun aplikasi web interaktif dengan framework React yang populer.",
          image: materi4,
        },
        {
          slug: "api-backend",
          title: "Koneksi API dan Backend",
          description:
            "Pelajari cara menghubungkan front-end dengan API dan backend server.",
          image: materi5,
        },
        {
          slug: "deploy-website",
          title: "Deploy Website ke Internet",
          description:
            "Langkah-langkah praktis untuk meng-online-kan website kamu.",
          image: materi6,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (slug) => {
    if (user) {
      navigate(`/kursus/${slug}`);
    } else {
      setTargetSlug(slug);
      setShowLoginModal(true);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function untuk truncate text
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex items-center justify-center">
          <div className="text-lg">Loading courses...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="grow pt-8 md:pt-12 -mt-8 md:-mt-5">
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Jelajahi Kursusmu Sekarang
          </h1>

          {/* Search Bar */}
          <div className="flex justify-center mb-10">
            <input
              type="text"
              placeholder="Cari kursus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Grid of Kursus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((kursus) => (
              <div
                key={kursus.id || kursus.slug}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
              >
                {/* Gambar kursus */}
                <img
                  src={kursus.image}
                  alt={kursus.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />

                <h2 className="text-lg font-semibold mb-2">{kursus.title}</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {truncateText(kursus.description, 50)}
                </p>

                {/* Mulai Belajar: jika user logged in => navigate, else show modal */}
                <button
                  onClick={() => handleStart(kursus.slug)}
                  className="block w-full text-center bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition"
                >
                  Mulai Belajar
                </button>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              Tidak ada kursus yang ditemukan
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Login required modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 text-center shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Perlu Login</h3>
            <p className="text-sm text-gray-600 mb-6">
              Anda harus login terlebih dahulu untuk memulai kursus.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login", { state: { redirectTo: `/kursus/${targetSlug}` } });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Login Sekarang
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageKursus;
