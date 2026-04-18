import { useState, useRef } from 'react';
import api from '../utils/api';

interface Props {
  onUpload: (urls: string[]) => void;
  accept?: string;
  label?: string;
}

export default function MediaUpload({ onUpload, accept = 'image/*,video/*', label = 'Add Photos or Videos' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    setProgress(0);
    const urls: string[] = [];
    const localPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      localPreviews.push(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round(((i / files.length) + (e.loaded / e.total / files.length)) * 100));
          },
        });
        urls.push(res.data.url);
      } catch (err) {
        console.error('Upload failed for', file.name);
      }
    }

    setPreviews(localPreviews);
    setUploading(false);
    setProgress(100);
    onUpload(urls);
  };

  return (
    <div>
      <div
        className="border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center cursor-pointer bg-amber-50 hover:bg-amber-100 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
      >
        <div className="text-4xl mb-2">📸</div>
        <p className="text-carol-secondary font-body text-sm font-medium">{label}</p>
        <p className="text-carol-muted font-body text-xs mt-1">Tap to choose from your device</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />
      </div>

      {uploading && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-carol-muted mb-1 font-body">
            <span>Uploading...</span><span>{progress}%</span>
          </div>
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {previews.length > 0 && !uploading && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previews.map((src, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-amber-50">
              {src.startsWith('blob:') && /video/.test(src) ? (
                <video src={src} className="w-full h-full object-cover" />
              ) : (
                <img src={src} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
