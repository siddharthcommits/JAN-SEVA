"use client";

import React, { useState, Ref, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Camera,
  MapPin,
  Loader2,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Info
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const CATEGORIES = [
  "Roads & Potholes",
  "Sanitation & Garbage",
  "Street Lighting",
  "Water & Leakage",
  "Parks & Public Spaces",
  "Traffic & Safety",
  "Drains & Sewage",
  "Other",
];

const reportSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  description: z
    .string()
    .max(200, "Description must be under 200 characters")
    .min(10, "Description must be at least 10 characters"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationAddress: z.string().optional(),
  photoUrl: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

export default function ReportIssuePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userRole, setUserRole] = useState<string>("citizen");
  const [resolveMode, setResolveMode] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const [targetTaskId, setTargetTaskId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    const savedRole = localStorage.getItem("user_role");
    const userId = session?.user?.email || localStorage.getItem("user_id");
    const isDemo = localStorage.getItem("demo_logged_in") === "true";

    if (!userId && !isDemo) {
      toast.error("Please login to report an issue");
      router.push("/auth/login?redirect=/report");
      return;
    }

    setIsAuthChecking(false);

    if (savedRole === "authority") {
      setUserRole("authority");
    }
    
    const params = new URLSearchParams(window.location.search);
    if (params.get("resolve") === "true") {
      setResolveMode(true);
      setTargetTaskId(params.get("taskId"));
      setUserRole("authority");
    }
  }, [session, sessionStatus, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    mode: "onChange"
  });

  const formValues = watch();

  if (isAuthChecking || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setStep(2);
      toast.success("Photo captured successfully!");
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          const data = await res.json();
          if (data.url) {
            resolve(data.url);
          } else {
            resolve("/placeholder.png");
          }
        } catch (err) {
          resolve("/placeholder.png");
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'JanSevaApp/1.0' } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const parts = [
          addr.road || addr.pedestrian || addr.footway,
          addr.suburb || addr.neighbourhood || addr.village,
          addr.city || addr.town || addr.county,
          addr.state,
        ].filter(Boolean);
        return parts.slice(0, 3).join(', ') || data.display_name;
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
    }
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  };

  const detectLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setValue("latitude", lat);
          setValue("longitude", lng);
          const address = await reverseGeocode(lat, lng);
          setValue("locationAddress", address);
          setLocationDetected(true);
          setIsLocating(false);
          toast.success("Location pinpointed!");
        },
        (error) => {
          setIsLocating(false);
          const msg = error.code === 1
            ? "Location access denied. Please allow location permission."
            : error.code === 2
            ? "Location unavailable. Please try again."
            : "Location request timed out. Please try again.";
          toast.error(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      setIsLocating(false);
      toast.error("Geolocation is not supported on this browser.");
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    const userId = localStorage.getItem("user_id") || "citizen_demo";
    const userName = localStorage.getItem("user_name") || "Citizen";
    const submissionToast = toast.loading(resolveMode ? "Transmitting Resolution Audit..." : "Filing Civic Report...");

    try {
      let finalPhotoUrl = photoPreview || "/placeholder.png";
      
      if (selectedFile) {
        toast.loading("Uploading evidence...", { id: submissionToast });
        finalPhotoUrl = await uploadToCloudinary(selectedFile);
      }

      if (resolveMode && targetTaskId && targetTaskId !== "null") {
        const response = await fetch(`/api/tasks/${targetTaskId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            afterPhotoUrl: finalPhotoUrl, 
            notes: data.description,
            latitude: data.latitude || 28.6139,
            longitude: data.longitude || 77.2090
          }),
        });

        if (response.ok) {
          toast.success("Resolution completed! Scorecards updated.", { id: submissionToast });
          router.push("/dashboard");
          return;
        } else {
           const errData = await response.json();
           toast.error(`Verification Failed: ${errData.error || "Server Error"}`, { id: submissionToast });
        }
      } else {
        const response = await fetch("/api/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${data.category} Issue`,
            description: data.description,
            category: data.category,
            photoUrl: finalPhotoUrl, 
            latitude: data.latitude,
            longitude: data.longitude,
            locationAddress: data.locationAddress || "Public Area",
            reporterId: userId,
            anonymousUsername: userName,
            severity: "Medium"
          }),
        });

        if (response.ok) {
          toast.success("Report filed to Jan Seva!", { id: submissionToast });
          router.push("/reports");
        } else {
          toast.error("Failed to submit report.", { id: submissionToast });
        }
      }
    } catch (err) {
      toast.error("Network error. Please try again.", { id: submissionToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => {
    return (step / 4) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 pt-28">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary/5 border border-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
          {userRole === "authority" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {resolveMode ? "Official Resolution Audit" : (userRole === "authority" ? "Departmental Report" : "Secure Report Flow")}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight font-headline mb-3">
          {resolveMode ? "Certify" : "Report"} <span className={userRole === "authority" ? "text-secondary" : "text-primary"}>{resolveMode ? "Resolution" : (userRole === "authority" ? "Issue" : "Civic Issue")}</span>
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto font-light">
          {resolveMode 
            ? "Submit verifiable field evidence of completed work."
            : (userRole === "authority" 
              ? "Submit departmental evidence. Follow the protocol to notify the community."
              : "Follow the 4-step protocol to alert authorities and the community.")}
        </p>
      </div>

      {/* Progress Line */}
      <div className="mb-12 relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${getStepProgress()}%` }}
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden premium-shadow transition-all min-h-[500px] flex flex-col md:flex-row">
        
        {/* Left Status Navigation (Desktop) */}
        <div className="hidden md:flex w-64 border-r border-slate-100 bg-slate-50 p-8 flex-col justify-between">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`flex items-center gap-4 transition-all ${step === i ? 'opacity-100 translate-x-1' : 'opacity-40'}`}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${step === i ? 'bg-primary border-primary text-white' : step > i ? 'border-secondary bg-secondary/10 text-secondary' : 'border-slate-200 text-slate-500'}`}>
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    {userRole === "authority" 
                      ? (i === 1 ? "Work Evidence" : i === 2 ? "Site Location" : i === 3 ? "Official Notes" : "Submit Audit")
                      : (i === 1 ? "Evidence" : i === 2 ? "Location" : i === 3 ? "Analysis" : "Release")}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">Step 0{i}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 text-primary mb-2 font-bold text-[10px] uppercase">
              <Info className="w-3.5 h-3.5" />
              Privacy Note
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Your real identity is masked. Authorities see only your verified citizen token.
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 sm:p-8 md:p-12 relative overflow-y-auto">
          <form 
            onSubmit={handleSubmit(onSubmit, (errs) => {
              const firstError = Object.values(errs)[0];
              if (firstError) toast.error(String(firstError.message));
            })} 
            className="h-full flex flex-col"
          >
            
            {/* STEP 1: PHOTO CAPTURE */}
            {step === 1 && (
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-slate-900 font-headline mb-8">
                  Step 1: Capture Evidence
                </h2>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative h-64 sm:h-80 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center ${photoPreview ? 'border-primary/50' : 'border-slate-200 hover:border-primary/50 hover:bg-primary/5'}`}
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-12 h-12 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Camera className="w-10 h-10 text-slate-300 group-hover:text-primary" />
                      </div>
                      <p className="text-slate-700 font-bold text-sm mb-2">Click to Launch Camera</p>
                      <p className="text-slate-400 text-xs font-medium">Accepting JPEG, PNG (Max 10MB)</p>
                    </>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoCapture}
                  capture="environment"
                />

                <div className="mt-12 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!photoPreview}
                    className="flex items-center gap-3 px-8 py-4 bg-primary disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl font-bold text-sm transition-all"
                  >
                    Proceed to Location <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION */}
            {step === 2 && (
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-slate-900 font-headline mb-8">
                  Step 2: Pinpoint Location
                </h2>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center mb-12">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-all ${locationDetected ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-300'}`}>
                    <Navigation className={`w-10 h-10 ${isLocating ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  {locationDetected ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">Location Locked</h3>
                      <p className="text-slate-500 font-mono text-sm">{formValues.latitude?.toFixed(5)}, {formValues.longitude?.toFixed(5)}</p>
                      <div className="px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-lg inline-block text-secondary text-xs font-bold">
                        {formValues.locationAddress}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-slate-500 font-light max-w-xs mx-auto text-sm leading-relaxed mb-6">
                        We need high-accuracy coordinates to ensure the correct department is alerted.
                      </p>
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={isLocating}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-primary text-white mx-auto rounded-2xl font-bold text-sm transition-all"
                      >
                        {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        {isLocating ? "Locating..." : "Pinpoint My Location"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-bold text-sm transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to Evidence
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!locationDetected}
                    className="flex items-center gap-3 px-8 py-4 bg-primary disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl font-bold text-sm transition-all"
                  >
                    Analyze Issue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-slate-900 font-headline mb-8">
                  Step 3: Issue Details
                </h2>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-4">Select Category</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setValue("category", cat, { shouldValidate: true })}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                            formValues.category === cat
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:border-primary/50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-sm font-medium text-slate-500">Description</label>
                      <span className={`text-xs font-medium ${formValues.description?.length > 200 ? "text-red-500" : "text-slate-300"}`}>
                        {formValues.description?.length || 0}/200
                      </span>
                    </div>
                    <textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Describe the issue and its community impact..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none text-sm font-medium leading-relaxed"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs font-medium mt-2">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-12 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-bold text-sm transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Change Location
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const isValid = await trigger(["category", "description"] as any);
                      if (isValid) setStep(4);
                    }}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm transition-all"
                  >
                    Final Review <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-extrabold text-slate-900 font-headline mb-8">
                  Step 4: Review & Submit
                </h2>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex-1 mb-8 overflow-y-auto">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-48 h-48 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                       <img src={photoPreview || "/placeholder.png"} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">Category</p>
                          <p className="text-slate-900 font-bold">{formValues.category}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">Location</p>
                          <p className="text-slate-900 font-bold truncate">{formValues.locationAddress}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">Description</p>
                        <p className="text-slate-700 text-sm italic">"{formValues.description}"</p>
                      </div>
                      <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                         <span className="text-xs font-bold uppercase tracking-widest text-primary">Identity Masking Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-bold text-sm transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Modify Details
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-3 px-12 py-5 bg-primary text-white rounded-2xl font-bold text-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
