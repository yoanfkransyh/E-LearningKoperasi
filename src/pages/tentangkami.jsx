import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import logo from "../assets/logo-bogor.png";

const TentangKami = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white antialiased text-gray-800">
      {/* Navbar */}
      <Navbar />

      {/* Konten Utama - Profil Dinas + Hero + Konten */}
      <main className="grow px-6 md:px-20 py-16 md:py-28">
        {/* Profile Dinas (logo + ringkasan, tanpa border/grid) */}
        <section className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            <div className="text-center bg-white rounded-2xl p-6 md:p-10 w-full md:w-3/4 lg:w-2/3">
              <div className="flex flex-col items-center gap-4">
                <img
                  src={logo}
                  alt="Logo Kota Bogor"
                  className="w-20 h-20 object-contain"
                />
                <div className="max-w-2xl mx-auto text-justify">
                  <div className="text-lg font-bold text-gray-900 mb-2 text-center">
                    Profil Dinas
                  </div>
                  <p className="text-base text-gray-600 mb-4 leading-relaxed">
                      Dinas Koperasi dan UMKM Kota Bogor bertugas membina,
                    mengembangkan, dan mengawasi koperasi di wilayah Kota Bogor.
                    Kami mendukung pertumbuhan koperasi agar lebih profesional dan
                    membantu peningkatan kesejahteraan masyarakat.
                  </p>
                  <p className="text-base text-gray-600 mb-4 leading-relaxed">
                      Layanan kami meliputi pendampingan pembentukan koperasi,
                    fasilitasi legalitas, pembinaan kelembagaan, maupun
                    pengembangan usaha. Semua layanan disediakan agar koperasi
                    dapat tumbuh berkelanjutan.
                  </p>
                  <p className="text-base text-gray-600 leading-relaxed">
                      Dinas didukung oleh tim profesional yang siap memberikan
                    dukungan praktis serta berkelanjutan untuk memperkuat ekonomi
                    kerakyatan melalui pemberdayaan koperasi dan UMKM lokal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="max-w-6xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-white via-blue-50 to-white rounded-3xl p-10 md:p-14 shadow-xl">
            <div className="md:flex md:items-center md:gap-8">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">
                  Tentang Kop-Learn
                </h1>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl">
                  Kop-Learn adalah platform e-learning inovatif yang hadir untuk memperkuat ekosistem koperasi di Indonesia melalui pendidikan dan pelatihan berbasis digital. Kami menyediakan berbagai kursus interaktif yang dirancang khusus untuk mendukung kebutuhan anggota, pengurus, maupun pengawas koperasi..
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm md:shadow-md w-56 text-left">
                  <div className="text-xs text-gray-500 uppercase font-semibold">
                    Berguna untuk
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    Pengurus • Pengawas • Koperasi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Konten Utama: Visi (kiri) dan Misi (kanan) berdampingan */}
        <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* Visi - Left */}
          <div className="rounded-2xl bg-white p-8 shadow-sm md:shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-3">Visi</h2>
            <p className="text-gray-700 leading-relaxed">
              Menjadi platform e-learning terpercaya yang mendorong koperasi di
              Kota Bogor lebih modern, mandiri, dan berdaya saing melalui
              pemanfaatan teknologi.
            </p>
          </div>

          {/* Misi - Right */}
          <div className="rounded-2xl bg-white p-8 shadow-sm md:shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-3">Misi</h2>
            <ul className="list-none space-y-4 text-gray-700">
              <li className="flex gap-3 items-start">
                <span className="flex-none inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                  1
                </span>
                <div>
                  <div className="font-medium">Akses Pendidikan Digital</div>
                  <div className="text-sm text-gray-600">
                    Memudahkan akses pendidikan koperasi berbasis digital.
                  </div>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex-none inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                  2
                </span>
                <div>
                  <div className="font-medium">Peningkatan Kapasitas</div>
                  <div className="text-sm text-gray-600">
                    Meningkatkan kapasitas SDM koperasi lokal.
                  </div>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex-none inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                  3
                </span>
                <div>
                  <div className="font-medium">Kolaborasi Berkelanjutan</div>
                  <div className="text-sm text-gray-600">
                    Mendorong kolaborasi dan praktik bisnis yang berkelanjutan.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TentangKami;
