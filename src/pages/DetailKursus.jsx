/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const DetailKursus = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState({});
  // Render description: setiap newline dianggap paragraf baru
  const renderDescription = (text, className = "text-gray-700") => {
    if (!text) return null;
    return text
      .split(/\n+/) // split on one or more newlines
      .map((para, idx) => (
        <p key={idx} className={`${className} mb-3 text-justify leading-relaxed`}>
          {para.trim()}
        </p>
      ));
  };

  useEffect(() => {
    fetchCourse();
    fetchQuestions();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", id)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", id)
        .single();

      if (courseError) {
        console.error("Error fetching course:", courseError);
        return;
      }

      if (!courseData) return;

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("course_id", courseData.id)
        .order("created_at", { ascending: false });

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return;
      }

      const questionUserIds = [
        ...new Set(
          questionsData.map((q) => q.user_id).filter(Boolean)
        ),
      ];
      let questionProfiles = [];

      if (questionUserIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", questionUserIds);

        if (profilesError) {
          console.error("Error fetching question profiles:", profilesError);
        } else {
          questionProfiles = profilesData || [];
        }
      }

      // Fetch answers for all questions
      const questionIds = questionsData.map((q) => q.id);
      let answersData = [];

      if (questionIds.length > 0) {
        const { data: answersResult, error: answersError } = await supabase
          .from("answers")
          .select("*")
          .in("question_id", questionIds)
          .order("created_at", { ascending: true });

        if (answersError) {
          console.error("Error fetching answers:", answersError);
        } else {
          answersData = answersResult || [];
        }
      }

      const answerUserIds = [
        ...new Set(
          answersData.map((a) => a.user_id).filter(Boolean)
        ),
      ];
      let answerProfiles = [];

      if (answerUserIds.length > 0) {
        const { data: answerProfilesData, error: answerProfilesError } =
          await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", answerUserIds);

        if (answerProfilesError) {
          console.error("Error fetching answer profiles:", answerProfilesError);
        } else {
          answerProfiles = answerProfilesData || [];
        }
      }

      const questionsWithDetails = questionsData.map((question) => {
        const userProfile = questionProfiles?.find(
          (p) => p.id === question.user_id
        );
        const questionAnswers = answersData.filter(
          (a) => a.question_id === question.id
        );

        const answersWithProfiles = questionAnswers.map((answer) => ({
          ...answer,
          profiles: answerProfiles?.find((p) => p.id === answer.user_id),
        }));

        return {
          ...question,
          profiles: userProfile,
          answers: answersWithProfiles,
        };
      });

      setQuestions(questionsWithDetails);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    try {
      const { error } = await supabase.from("questions").insert({
        course_id: course.id,
        user_id: user.id,
        question: questionText,
      });

      if (error) throw error;
      setQuestionText("");
      fetchQuestions();
    } catch (error) {
      console.error("Error submitting question:", error);
      alert("Error: " + error.message);
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    try {
      const { error } = await supabase.from("answers").insert({
        question_id: questionId,
        user_id: user.id,
        answer: answerText[questionId],
      });

      if (error) throw error;
      setAnswerText({ ...answerText, [questionId]: "" });
      fetchQuestions();
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Error: " + error.message);
    }
  };

  const isAdmin = () => profile?.role === "admin";

  useEffect(() => {
    if (!course?.id) return;

    const questionsSubscription = supabase
      .channel(`questions_${course.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: `course_id=eq.${course.id}`,
        },
        (payload) => {
          console.log("Questions change:", payload);
          fetchQuestions();
        }
      )
      .subscribe();

    const answersSubscription = supabase
      .channel(`answers_${course.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
        },
        (payload) => {
          console.log("Answers change:", payload);
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsSubscription);
      supabase.removeChannel(answersSubscription);
    };
  }, [course?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="grow flex items-center justify-center">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="grow flex items-center justify-center text-gray-600 text-lg">
          Kursus tidak ditemukan 😕
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow bg-gray-50 pt-20">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Judul */}
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            {course.title}
          </h1>

          {/* Tampilan PDF */}
          {course.pdf_url && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-8">
              <iframe
                src={course.pdf_url}
                title={course.title}
                className="w-full h-[500px] rounded-lg border-0"
              ></iframe>
            </div>
          )}

          {/* Deskripsi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-3">Deskripsi Kursus</h2>
            <div>{renderDescription(course.description)}</div>
          </div>

          {/* Tanya Jawab */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Tanya Jawab</h2>

            {/* Form Pertanyaan - Hanya untuk User biasa */}
            {user && !isAdmin() ? (
              <form onSubmit={handleSubmitQuestion} className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900 overflow-hidden flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {profile?.full_name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <textarea
                    className="grow border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ajukan pertanyaan Anda di sini..."
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="mt-3 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition font-medium"
                >
                  Kirim Pertanyaan
                </button>
              </form>
            ) : user && isAdmin() ? (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-blue-800 font-medium">
                    Anda dapat menjawab pertanyaan dari pengguna di bawah ini
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-center">
                  <span className="font-medium">
                    Silakan login untuk mengajukan pertanyaan
                  </span>
                </p>
              </div>
            )}

            {/* Daftar Pertanyaan */}
            <div className="space-y-6">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {/* Pertanyaan */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                      {q.profiles?.avatar_url ? (
                        <img
                          src={q.profiles.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-700 font-bold">
                          {q.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div className="grow">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {q.profiles?.full_name || "User"}
                        </p>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Pengguna
                        </span>
                      </div>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {q.question}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(q.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Jawaban dari Admin */}
                  {q.answers && q.answers.length > 0 && (
                    <div className="ml-8 space-y-3 border-l-2 border-blue-200 pl-4">
                      {q.answers.map((ans) => (
                        <div key={ans.id} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center">
                              {ans.profiles?.avatar_url ? (
                                <img
                                  src={ans.profiles.avatar_url}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-sm">
                                  {ans.profiles?.full_name?.[0]?.toUpperCase() ||
                                    "A"}
                                </span>
                              )}
                            </div>
                            <div className="grow">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-semibold text-blue-900 text-sm">
                                  {ans.profiles?.full_name || "Admin"}
                                </p>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Admin
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">
                                {ans.answer}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(ans.created_at).toLocaleString(
                                  "id-ID"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form Jawaban - Hanya untuk Admin */}
                  {user && isAdmin() && (
                    <div className="ml-8 mt-4 border-l-2 border-blue-200 pl-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {profile?.full_name?.[0]?.toUpperCase() || "A"}
                            </span>
                          )}
                        </div>
                        <div className="grow">
                          <textarea
                            placeholder="Tulis jawaban sebagai admin..."
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            value={answerText[q.id] || ""}
                            onChange={(e) =>
                              setAnswerText({
                                ...answerText,
                                [q.id]: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => handleSubmitAnswer(q.id)}
                            disabled={!answerText[q.id]?.trim()}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Jawab sebagai Admin
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Belum ada pertanyaan.{" "}
                    {!isAdmin() && user && "Jadilah yang pertama bertanya!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetailKursus;
