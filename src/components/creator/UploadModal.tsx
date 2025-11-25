import { useState, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Film,
  ChevronDown,
  Check,
  Lock,
  DollarSign,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (files: File[], options: UploadOptions) => void;
}

interface UploadOptions {
  isLocked: boolean;
  unlockPrice: number;
  caption: string;
  isSubscriberOnly: boolean;
}

type MediaFilter = 'all' | 'videos' | 'photos';

export function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPrice, setUnlockPrice] = useState(4.99);
  const [caption, setCaption] = useState('');
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onUpload(selectedFiles, {
      isLocked,
      unlockPrice,
      caption,
      isSubscriberOnly,
    });
    onClose();
  };

  const filteredFilesByType = selectedFiles.filter((file) => {
    if (mediaFilter === 'videos') return file.type.startsWith('video/');
    if (mediaFilter === 'photos') return file.type.startsWith('image/');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-neutral-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-sm font-medium text-white">Recents</span>
            <ChevronDown className="w-4 h-4 text-white/50" />
          </div>

          <div className="w-9" /> {/* Spacer */}
        </div>

        {step === 'select' ? (
          <>
            {/* Media Type Tabs */}
            <div className="flex items-center border-b border-white/10">
              {(['all', 'videos', 'photos'] as MediaFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setMediaFilter(filter)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                    mediaFilter === filter
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {mediaFilter === filter && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Drop Zone / Preview Grid */}
            <div
              className="flex-1 overflow-y-auto p-4 min-h-[300px]"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFiles.length === 0 ? (
                <div
                  className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-colors ${
                    isDragging
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-white font-medium mb-2">
                    Drag and drop or select files
                  </p>
                  <p className="text-white/50 text-sm mb-4">
                    Photos and videos
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:brightness-110 transition-all"
                  >
                    Select Files
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((preview, index) => {
                    const file = selectedFiles[index];
                    const isVideo = file?.type.startsWith('video/');

                    // Filter check
                    if (
                      mediaFilter === 'videos' &&
                      !file?.type.startsWith('video/')
                    )
                      return null;
                    if (
                      mediaFilter === 'photos' &&
                      !file?.type.startsWith('image/')
                    )
                      return null;

                    return (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden group"
                      >
                        {isVideo ? (
                          <video
                            src={preview}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={preview}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Video indicator */}
                        {isVideo && (
                          <div className="absolute top-2 right-2">
                            <Film className="w-4 h-4 text-white drop-shadow-lg" />
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>

                        {/* Selected check */}
                        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Add more button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-8 h-8 text-white/40" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" className="rounded accent-purple-600" />
                Select multiple
              </label>

              <button
                onClick={() => setStep('configure')}
                disabled={selectedFiles.length === 0}
                className="px-8 py-2.5 rounded-full bg-white/10 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Configure Step */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Preview */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    {selectedFiles[index]?.type.startsWith('video/') ? (
                      <video
                        src={preview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption... #hashtags work too!"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                  rows={3}
                />
              </div>

              {/* Monetization Options */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Monetization
                </h3>

                {/* Lock Content Toggle */}
                <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Lock this content</p>
                      <p className="text-white/50 text-xs">
                        Fans pay to unlock
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLocked}
                    onChange={(e) => setIsLocked(e.target.checked)}
                    className="w-5 h-5 rounded accent-purple-600"
                  />
                </label>

                {/* Price Input (shown when locked) */}
                {isLocked && (
                  <div className="ml-4 pl-4 border-l-2 border-purple-500/30 space-y-3">
                    <div>
                      <label className="block text-xs text-white/60 mb-2">
                        Unlock Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="number"
                          value={unlockPrice}
                          onChange={(e) =>
                            setUnlockPrice(parseFloat(e.target.value) || 0)
                          }
                          min="0.99"
                          step="0.50"
                          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                    </div>

                    {/* Subscriber Only Option */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSubscriberOnly}
                        onChange={(e) => setIsSubscriberOnly(e.target.checked)}
                        className="w-4 h-4 rounded accent-purple-600"
                      />
                      <div>
                        <p className="text-sm text-white">Free for subscribers</p>
                        <p className="text-xs text-white/50">
                          Only non-subscribers pay
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-3 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Post
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
}
