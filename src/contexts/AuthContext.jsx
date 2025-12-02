/* @refresh reset */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (access_token && type === 'signup') {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token
        });
        
        if (!error && data.user) {
          setUser(data.user);
          await fetchProfile(data.user.id);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleEmailConfirmation();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `https://yoanfkransyh.github.io/E-LearningKoperasi/`,
        },
      });

      if (error) throw error;

      const identities = data?.user?.identities ?? [];
      if (identities.length === 0) {
        return {
          data: null,
          error: new Error("Email sudah terdaftar. Silakan login atau reset password."),
        };
      }

      if (!data?.user) {
        return {
          data: null,
          error: new Error(
            "Gagal mendaftar. Email mungkin sudah terdaftar atau diperlukan konfirmasi. Coba login atau reset password."
          ),
        };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setProfile(profileData);

      return { data: { ...data, profile: profileData }, error };
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setLoading(false);
      return { error };
    } catch (err) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return { error: err };
    }
  };

  const isAdmin = () => profile?.role === "admin";

  const updateProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default undefined;