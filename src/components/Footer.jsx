import React from "react";
import igIcon from "../assets/ig.png";
import ytIcon from "../assets/yt.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-3 gap-8 items-start">
        {/* Address */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Dinas Koperasi & UMKM</h4>
          <address className="not-italic text-sm leading-relaxed text-blue-100">
            Jl. Dadali II No.3, RT.01/RW.05, Tanah Sareal, Kota Bogor<br />
            Jawa Barat 16161
          </address>
          <div className="mt-4 text-sm text-blue-200">Jam layanan: Senin - Jumat, 08:00 - 16:00</div>
        </div>

        {/* Map */}
        <div className="text-center">
          <h4 className="font-semibold mb-3 text-white">Peta Lokasi</h4>
          <div className="rounded-lg overflow-hidden shadow-lg border border-blue-800">
            <iframe
              title="Peta Lokasi Dinas Koperasi Kota Bogor"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1019.94329644384!2d106.80524931142492!3d-6.568266641491379!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c43d3a73a3f3%3A0x5dd62ee0dbba6705!2sDinas%20Koperasi%20dan%20UMKM%20Kota%20Bogor!5e0!3m2!1sen!2sus!4v1761822580151!5m2!1sen!2sus"
              className="w-full h-44 md:h-48 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Contact / Social */}
        <div className="md:ml-6 lg:ml-20">
          <h4 className="font-semibold mb-3 text-white">Contact</h4>
          <div className="flex flex-col gap-3">
            <a
              href="https://www.instagram.com/dinas_kukmdagin_kotabogor/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-blue-100 hover:text-white transition"
              aria-label="Instagram Dinas Koperasi Kota Bogor"
            >
              <img src={igIcon} alt="Instagram" className="w-5 h-5" />
              <span className="text-sm">Instagram Dinkum</span>
            </a>
            <a
              href="https://www.youtube.com/@dinaskukmdaginkotabogor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-blue-100 hover:text-white transition"
              aria-label="YouTube Dinas Koperasi Kota Bogor"
            >
              <img src={ytIcon} alt="YouTube" className="w-5 h-5" />
              <span className="text-sm">YouTube Dinkum</span>
            </a>
            <a className="text-sm text-blue-200 hover:text-white transition" href="mailto:info@kotabogor.go.id" aria-label="Kirim email ke Dinas Koperasi">
              info@kotabogor.go.id
            </a>
            <a className="text-sm text-blue-200 hover:text-white transition" href="tel:+622512345678" aria-label="Telepon Dinas Koperasi">
              (0251) 123-4567
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-800 mt-10 pt-5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-blue-200">
          <div>© {year} Dinas Koperasi, Usaha Kecil Menengah, Perdagangan dan Perindustrian Kota Bogor</div>
          <div className="flex gap-4 items-center">
            <a href="/privacy" className="hover:text-white">Kebijakan Privasi</a>
            <a href="/terms" className="hover:text-white">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
