// src/pages/admin/CoursesManagement.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import CourseFormModal from "../../components/admin/CourseFormModal";

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/api/admin/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Gagal fetch kursus:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (id) => {
    const confirmDelete = confirm("Yakin ingin menghapus kursus?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Kursus berhasil dihapus");
        setCourses((prev) => prev.filter((course) => course.id !== id));
      } else {
        alert("Gagal menghapus kursus");
      }
    } catch (err) {
      console.error("Gagal menghapus kursus:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Manajemen Kursus</h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setShowFormModal(true)}
          >
            + Tambah Kursus
          </button>
        </div>

        <table className="w-full border-collapse bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Judul</th>
              <th className="border p-3 text-left">Deskripsi</th>
              <th className="border p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="border p-3">{course.title}</td>
                <td className="border p-3">{course.description}</td>
                <td className="border p-3 text-center space-x-2">
                  <button className="px-3 py-1 bg-yellow-400 text-white rounded-lg">Edit</button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded-lg"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  Belum ada kursus
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>

      {showFormModal && (
        <CourseFormModal
          onClose={() => setShowFormModal(false)}
          onSuccess={(newCourse) => setCourses([...courses, newCourse])}
        />
      )}
    </div>
  );
};

export default CoursesManagement;
