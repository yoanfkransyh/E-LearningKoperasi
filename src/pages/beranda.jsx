import React from "react";
import hero from "../assets/bg.png";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

const Beranda = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section
        id="beranda"
        className="h-[80vh] bg-cover bg-center flex items-center justify-center text-center text-white relative pt-16"
        style={{
          backgroundImage: `url(${hero})`,
        }}
      >
        <div className="relative z-10 px-6">
          <h1 className="text-4xl font-bold mb-3">
            Selamat Datang di Kop-Learn
          </h1>
          <p className="text-lg">
            Platform e-learning terdepan untuk pengembangan pengetahuan dan
            keterampilan di bidang koperasi
          </p>
        </div>
      </section>

      {/* TINGKATKAN KOMPETENSI */}
      <section className="py-20 text-center max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-4">
          Tingkatkan Kompetensi Koperasi Anda
        </h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
        <p className="text-gray-600 leading-relaxed">
          Kop-Learn adalah platform e-learning inovatif yang hadir untuk
          memperkuat ekosistem koperasi di Indonesia melalui pendidikan dan
          pelatihan berbasis digital. Kami menyediakan berbagai kursus
          interaktif yang dirancang khusus untuk mendukung kebutuhan anggota,
          pengurus, maupun pengawas koperasi.
        </p>
      </section>

      {/* LANGKAH MENGGUNAKAN */}
      <section className="bg-gray-50 py-16 text-center px-6">
        <h2 className="text-2xl font-bold mb-4">
          Langkah Menggunakan Kop-Learn
        </h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {[
            {
              number: "1",
              title: "Daftar Akun",
              desc: "Buat akun baru untuk memulai perjalanan belajar anda di Kop-Learn",
            },
            {
              number: "2",
              title: "Pilih Kursus",
              desc: "Jelajahi berbagai kursus yang tersedia dan pilih yang ingin anda ikuti",
            },
            {
              number: "3",
              title: "Mulai Belajar",
              desc: "Akses materi kursus kapan saja dan di mana saja",
            },
          ].map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-xl p-6 transition-transform transform duration-300 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              tabIndex={0}
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-700 text-white text-2xl flex items-center justify-center font-bold mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KURSUS KEUNGGULAN */}
      <section id="kursus" className="py-20 text-center px-6">
        <h2 className="text-2xl font-bold mb-4">Kursus Keunggulan Kami</h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto mb-10"></div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Dasar-Dasar Perkoperasian",
              desc: "Pelajari sejarah, nilai, dan prinsip dasar yang menjadi landasan gerakan koperasi.",
            },
            {
              title: "Manajemen Keuangan Koperasi",
              desc: "Kuasi cara mengelola keuangan koperasi secara efektif dan transparan.",
            },
            {
              title: "Digitalisasi Koperasi",
              desc: "Adaptasi dengan teknologi terkini untuk meningkatkan efisiensi dan pelayanan koperasi.",
            },
          ].map((kursus, i) => (
            <div
              key={i}
              className="bg-white shadow-md rounded-xl p-5 transition-transform transform duration-300 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-2xl will-change-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              tabIndex={0}
            >
              <h3 className="font-semibold text-lg mb-2">{kursus.title}</h3>
              <p className="text-gray-600">{kursus.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Beranda;
