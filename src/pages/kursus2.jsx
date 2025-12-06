import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

import materi1 from "../assets/materi1.jpeg"; 
import materi2 from "../assets/materi2.jpeg";

const Kursus2 = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-xl font-semibold mb-6">
          Analisis Laporan Keuangan Koperasi
        </h1>

        {/* Tabs */}
        <div className="flex gap-6 border-b pb-2 mb-6">
          <button className="font-medium border-b-2 border-blue-600 text-blue-600 pb-1">
            Course
          </button>
          <button className="font-medium text-gray-600 hover:text-black">
            Participants
          </button>
        </div>

        {/* Dropdown 1 */}
        <div className="bg-white rounded-xl shadow p-4 mb-5">
          <details open>
            <summary className="cursor-pointer font-semibold flex items-center justify-between">
              <span>Kursus</span>
            </summary>

            <div className="mt-4">
              <a href="#" className="text-blue-600 underline">
                Announcements
              </a>
            </div>
          </details>
        </div>

        {/* Dropdown Materi 1 */}
        <div className="bg-white rounded-xl shadow p-4 mb-5">
          <details>
            <summary className="cursor-pointer font-semibold">
              Materi 1
              <p className="text-sm text-gray-600 font-normal">Ideologi Koperasi</p>
            </summary>

            <div className="mt-4 flex items-center gap-4">
              <img src={materi1} alt="Materi 1" className="w-40 rounded" />

              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Materi ini menjelaskan tentang ideologi koperasi…
                </p>
                <p className="text-xs text-gray-500 mt-1">01 Desember 2025</p>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Lihat Materi
              </button>
            </div>
          </details>
        </div>

        {/* Dropdown Materi 2 */}
        <div className="bg-white rounded-xl shadow p-4">
          <details>
            <summary className="cursor-pointer font-semibold">
              Materi 2
              <p className="text-sm text-gray-600 font-normal">
                Analisis Laporan Keuangan Koperasi
              </p>
            </summary>

            <div className="mt-4 flex items-center gap-4">
              <img src={materi2} alt="Materi 2" className="w-40 rounded" />

              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Materi ini menjelaskan tentang analisis laporan keuangan koperasi…
                </p>
                <p className="text-xs text-gray-500 mt-1">01 Desember 2025</p>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Lihat Materi
              </button>
            </div>
          </details>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Kursus2;
