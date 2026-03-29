import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/axios';
import toast from 'react-hot-toast';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Ward {
  _id: string;
  name: string;
  wardNumber: number;
  city: string;
  state: string;
}

interface Department {
  _id: string;
  name: string;
}

const IMAGEKIT_PUBLIC_KEY = 'public_O6ij2BGxhFwuRCv75GQfnAIn4jw=';

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('road');
  const [wardId, setWardId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wards, setWards] = useState<Ward[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'found' | 'error'>('detecting');
  const [locationName, setLocationName] = useState('');
  
  // Image upload state
  const [images, setImages] = useState<string[]>([]);
  console.log(images);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch wards and departments
    api.get('/data/wards').then(res => {
      if (res.data?.data) setWards(res.data.data);
    }).catch(() => {});

    api.get('/data/departments').then(res => {
      if (res.data?.data) setDepartments(res.data.data);
    }).catch(() => {});

    // Get geolocation
    setLocationStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocationStatus('found');
          setLocationName(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          setLatitude(28.6139);
          setLongitude(77.2090);
          setLocationStatus('error');
          setLocationName('Default: New Delhi');
        }
      );
    } else {
      setLatitude(28.6139);
      setLongitude(77.2090);
      setLocationStatus('error');
      setLocationName('Geolocation not supported');
    }
  }, [isOpen]);

  // Auto-map category to department
  useEffect(() => {
    if (departments.length === 0) return;
    const categoryDeptMap: Record<string, string> = {
      road: 'Roads & Highways',
      garbage: 'Sanitation',
      sewage: 'Water Supply',
      water: 'Water Supply',
      electricity: 'Power',
    };
    const deptName = categoryDeptMap[category];
    const matched = departments.find(d => d.name === deptName);
    if (matched) setDepartmentId(matched._id);
  }, [category, departments]);

  // Auto-select first ward
  useEffect(() => {
    if (wards.length > 0 && !wardId) {
      setWardId(wards[0]._id);
    }
  }, [wards, wardId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    setUploading(true);
    try {
      // Get auth params from backend
      const authRes = await api.get('/imagekit/auth');
      const authParams = authRes.data?.data;
      
      if (!authParams) {
        throw new Error('Failed to get upload authentication');
      }

      const uploadedUrls: string[] = [];
      
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `issue_${Date.now()}_${file.name}`);
        formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
        formData.append('signature', authParams.signature);
        formData.append('expire', String(authParams.expire));
        formData.append('token', authParams.token);

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Image upload failed');
        }

        const result = await uploadRes.json();
        uploadedUrls.push(result.url);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Image upload error:', error);
      // Return empty array so submission can proceed without images
      toast.error('Image upload failed, submitting without images');
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardId || !departmentId) {
      toast.error('Please select a ward and department');
      return;
    }
    setIsLoading(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      const payload = {
        title,
        description,
        category,
        images: imageUrls,
        latitude: latitude || 28.6139,
        longitude: longitude || 77.2090,
        wardId,
        departmentId,
      };

      await api.post('/issues', payload);
      toast.success('Issue reported successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('road');
      setImageFiles([]);
      setImagePreviews([]);
      setImages([]);
      
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to report issue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest text-on-surface w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-8 py-6 border-b border-surface-container-low flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-black text-primary">Report an Issue</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 gap-5 flex flex-col overflow-y-auto">
          {/* Location Banner */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
            locationStatus === 'found' ? 'bg-emerald-50 text-emerald-700' :
            locationStatus === 'detecting' ? 'bg-blue-50 text-blue-700' :
            'bg-amber-50 text-amber-700'
          }`}>
            <span className="material-symbols-outlined text-lg">
              {locationStatus === 'found' ? 'my_location' : locationStatus === 'detecting' ? 'location_searching' : 'location_disabled'}
            </span>
            <span>
              {locationStatus === 'detecting' ? 'Detecting your location...' :
               locationStatus === 'found' ? `📍 Location: ${locationName}` :
               `⚠️ Using default: ${locationName}`}
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Pothole on Main Street"
              className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 'road', label: 'Road', icon: 'road' },
                { value: 'garbage', label: 'Garbage', icon: 'delete' },
                { value: 'sewage', label: 'Sewage', icon: 'water_damage' },
                { value: 'water', label: 'Water', icon: 'water_drop' },
                { value: 'electricity', label: 'Electric', icon: 'bolt' },
              ].map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                    category === cat.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-transparent bg-surface-container-low text-slate-500 hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ward & Department Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ward</label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl outline-none transition-colors"
              >
                <option value="">Select Ward</option>
                {wards.map(w => (
                  <option key={w._id} value={w._id}>
                    #{w.wardNumber} — {w.name}, {w.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl outline-none transition-colors"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl outline-none transition-colors resize-none"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Photos (optional, max 4)</label>
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="material-symbols-outlined text-3xl text-slate-400 mb-2 block">add_photo_alternate</span>
              <p className="text-sm text-slate-500 font-medium">Click to add photos</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB each</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || uploading}
              className="px-6 py-3 font-bold bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading || uploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  {uploading ? 'Uploading images...' : 'Submitting...'}
                </>
              ) : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};