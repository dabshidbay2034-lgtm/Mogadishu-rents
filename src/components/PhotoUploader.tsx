import { useCallback } from "react";
import { X, ImagePlus, Image as ImageIcon } from "lucide-react";

interface PhotoUploaderProps {
  photos: File[];
  setPhotos: React.Dispatch<React.SetStateAction<File[]>>;
  maxPhotos: number;
}

const PhotoUploader = ({ photos, setPhotos, maxPhotos }: PhotoUploaderProps) => {
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      setPhotos((prev) => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, maxPhotos);
      });
    },
    [maxPhotos, setPhotos]
  );

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Property Photos</p>
          <p className="text-xs text-muted-foreground">
            {photos.length}/{maxPhotos} photos uploaded
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ImageIcon className="w-3.5 h-3.5" />
          Max {maxPhotos}
        </div>
      </div>

      {/* Upload area */}
      {photos.length < maxPhotos && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors">
          <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground font-medium">Tap to add photos</span>
          <span className="text-[10px] text-muted-foreground">JPG, PNG up to 5MB each</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((file, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-accent text-accent-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                  Cover
                </span>
              )}
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-foreground/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-background" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-border rounded-full h-1.5">
        <div
          className="bg-accent h-1.5 rounded-full transition-all"
          style={{ width: `${(photos.length / maxPhotos) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default PhotoUploader;
